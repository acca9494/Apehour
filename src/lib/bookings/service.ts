// ─────────────────────────────────────────────────────────────────────────────
//  Booking service — logica di business, nessuna UI
//
//  Ogni funzione ha un commento che indica la query Supabase equivalente.
//  Per passare al backend reale: sostituire il corpo di ogni funzione.
// ─────────────────────────────────────────────────────────────────────────────

import { restaurants } from "@/lib/data/restaurants";
import {
  getAllBookings,
  getBookedSeatsForSlot,
  getClientBookings,
  getMerchantBookings,
  insertBooking,
  updateBookingStatus,
} from "./store";
import type {
  AvailabilityResult,
  BookingFormData,
  BookingStatus,
  ClientBooking,
  MerchantBookingView,
} from "./types";

// ── Utils interni ────────────────────────────────────────────────────────────

function generateRef(): string {
  const yr = new Date().getFullYear();
  const seq = getAllBookings().length + 1;
  return `APE-${yr}-${String(seq).padStart(5, "0")}`;
}

function generateId(): string {
  return `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function simulateLatency(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 1. Controllo disponibilità ───────────────────────────────────────────────
// Supabase: SELECT available_seats FROM availability_slots
//           WHERE restaurant_id = $1 AND date = $2 AND start_time = $3
//             AND is_active = TRUE

export async function checkAvailability(
  restaurantId: string,
  date: string,
  time: string,
  guests: number
): Promise<AvailabilityResult> {
  await simulateLatency(200);

  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) {
    return { available: false, availableSeats: 0, totalSeats: 0, reason: "Locale non trovato" };
  }

  const slot = restaurant.slots.find((s) => s.time === time);
  if (!slot) {
    return { available: false, availableSeats: 0, totalSeats: 0, reason: "Orario non disponibile" };
  }

  const bookedSeats = getBookedSeatsForSlot(restaurantId, date, time);
  const availableSeats = Math.max(slot.availableSeats - bookedSeats, 0);

  if (availableSeats <= 0) {
    return {
      available: false,
      availableSeats: 0,
      totalSeats: slot.availableSeats,
      reason: "Slot esaurito",
    };
  }

  if (guests > availableSeats) {
    return {
      available: false,
      availableSeats,
      totalSeats: slot.availableSeats,
      reason: `Solo ${availableSeats} post${availableSeats === 1 ? "o" : "i"} disponibil${availableSeats === 1 ? "e" : "i"} per questo orario`,
    };
  }

  return { available: true, availableSeats, totalSeats: slot.availableSeats };
}

// Restituisce tutti gli slot del giorno con la disponibilità reale
export async function getSlotsForDate(
  restaurantId: string,
  date: string
): Promise<Array<{ time: string; availableSeats: number; totalSeats: number; discount?: number; label?: string }>> {
  await simulateLatency(150);

  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) return [];

  return restaurant.slots.map((slot) => {
    const booked = getBookedSeatsForSlot(restaurantId, date, slot.time);
    return {
      time: slot.time,
      availableSeats: Math.max(slot.availableSeats - booked, 0),
      totalSeats: slot.availableSeats,
      discount: slot.discount,
      label: slot.label,
    };
  });
}

// ── 2. Crea prenotazione ─────────────────────────────────────────────────────
// Supabase: INSERT INTO bookings (...) VALUES (...)
//           + UPDATE availability_slots SET available_seats = available_seats - guests

export async function createBooking(
  formData: BookingFormData,
  customerId: string
): Promise<ClientBooking> {
  await simulateLatency(520);

  // Controlla disponibilità prima di creare
  const availability = await checkAvailability(
    formData.restaurantId,
    formData.date,
    formData.time,
    formData.guests
  );

  if (!availability.available) {
    throw new Error(availability.reason ?? "Slot non disponibile");
  }

  // Previeni doppia prenotazione (stesso utente, stesso locale, stessa data+ora)
  const existing = getClientBookings(customerId).find(
    (b) =>
      b.restaurantId === formData.restaurantId &&
      b.date === formData.date &&
      b.time === formData.time &&
      b.status !== "cancelled"
  );

  if (existing) {
    throw new Error("Hai già una prenotazione per questo orario in questo locale");
  }

  const now = new Date().toISOString();
  const booking: ClientBooking = {
    id: generateId(),
    bookingRef: generateRef(),
    restaurantId: formData.restaurantId,
    restaurantName: formData.restaurantName,
    restaurantSlug: formData.restaurantSlug,
    restaurantCity: formData.restaurantCity,
    customerId,
    date: formData.date,
    time: formData.time,
    guests: formData.guests,
    status: "confirmed",          // mock: auto-confirmed
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    customerPhone: formData.customerPhone,
    specialRequests: formData.specialRequests,
    depositRequired: false,        // mock: no caparra
    depositPaid: false,
    createdAt: now,
    updatedAt: now,
    confirmedAt: now,
  };

  insertBooking(booking);
  return booking;
}

// ── 3. Cancella prenotazione ─────────────────────────────────────────────────
// Supabase: UPDATE bookings SET status = 'cancelled', cancelled_at = NOW()
//           WHERE id = $1 AND customer_id = $2

export async function cancelBooking(
  bookingId: string,
  requesterId: string,     // cliente o commerciante
  reason?: string
): Promise<ClientBooking> {
  await simulateLatency(300);

  const updated = updateBookingStatus(bookingId, "cancelled", { cancelReason: reason });
  if (!updated) throw new Error("Prenotazione non trovata");
  // Autorizzazione: nel mock non verifichiamo requesterId,
  // ma in produzione: WHERE id = $1 AND (customer_id = $2 OR venue.owner_id = $2)
  void requesterId;
  return updated;
}

// ── 4. Aggiorna stato (commerciante) ─────────────────────────────────────────
// Supabase: UPDATE bookings SET status = $1 WHERE id = $2
//           (verificare che il booking appartiene a un locale del commerciante)

export async function updateStatus(
  bookingId: string,
  status: BookingStatus,
  reason?: string
): Promise<ClientBooking> {
  await simulateLatency(250);
  const updated = updateBookingStatus(bookingId, status, { cancelReason: reason });
  if (!updated) throw new Error("Prenotazione non trovata");
  return updated;
}

// ── 5. Storico cliente ───────────────────────────────────────────────────────
// Supabase: SELECT * FROM bookings WHERE customer_id = auth.uid() ORDER BY date DESC

export async function fetchClientBookings(customerId: string): Promise<ClientBooking[]> {
  await simulateLatency(280);
  return getClientBookings(customerId);
}

// ── 6. Storico commerciante ──────────────────────────────────────────────────
// Supabase: SELECT b.* FROM bookings b
//           JOIN restaurants r ON r.id = b.restaurant_id
//           WHERE r.owner_id = auth.uid() ORDER BY b.date DESC

export async function fetchMerchantBookings(
  restaurantIds: string[]
): Promise<MerchantBookingView[]> {
  await simulateLatency(300);
  return getMerchantBookings(restaurantIds);
}

// ── 7. Singola prenotazione ──────────────────────────────────────────────────
export async function fetchBookingById(id: string): Promise<ClientBooking | null> {
  await simulateLatency(150);
  const { getBookingById } = await import("./store");
  return getBookingById(id);
}
