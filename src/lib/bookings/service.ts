// ─────────────────────────────────────────────────────────────────────────────
//  Booking service — Supabase (tabella public.bookings)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/client";
import * as availabilityService from "@/lib/availability/service";
import type {
  AvailabilityResult,
  BookingFormData,
  BookingStatus,
  ClientBooking,
  MerchantBookingView,
} from "./types";

interface BookingRow {
  id: string;
  booking_ref: string;
  restaurant_id: string;
  customer_id: string;
  date: string;
  start_time: string;
  guests: number;
  status: BookingStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  special_requests: string | null;
  deposit_required: boolean;
  deposit_amount: number | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Nota: niente embedding "bookings.restaurants(...)" — quel join passa
// comunque dalla tabella restaurants, che non ha più una policy SELECT
// pubblica (per non esporre iban/vat_number/legal_name), quindi si romperebbe
// anche per un cliente autenticato che vede le proprie prenotazioni. Il
// locale va letto separatamente dalla vista pubblica restaurants_public.
async function attachRestaurants(
  rows: BookingRow[]
): Promise<Map<string, { name: string; slug: string; city: string }>> {
  const restaurantIds = [...new Set(rows.map((r) => r.restaurant_id))];
  if (restaurantIds.length === 0) return new Map();
  const supabase = createClient();
  const { data, error } = await supabase.from("restaurants_public").select("id, name, slug, city").in("id", restaurantIds);
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((r) => [r.id as string, { name: r.name as string, slug: r.slug as string, city: r.city as string }]));
}

function mapRow(row: BookingRow, restaurant?: { name: string; slug: string; city: string }): ClientBooking {
  return {
    id: row.id,
    bookingRef: row.booking_ref,
    restaurantId: row.restaurant_id,
    restaurantName: restaurant?.name ?? "",
    restaurantSlug: restaurant?.slug ?? "",
    restaurantCity: restaurant?.city ?? "",
    customerId: row.customer_id,
    date: row.date,
    time: row.start_time.slice(0, 5),
    guests: row.guests,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone ?? "",
    specialRequests: row.special_requests ?? undefined,
    depositRequired: row.deposit_required,
    depositAmount: row.deposit_amount ?? undefined,
    depositPaid: false, // i pagamenti reali non sono ancora collegati (fase pilota: nessun pagamento in app)
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    confirmedAt: row.confirmed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    cancelReason: row.cancel_reason ?? undefined,
  };
}

// ── 1. Controllo disponibilità ───────────────────────────────────────────────

export async function checkAvailability(
  restaurantId: string,
  date: string,
  time: string,
  guests: number
): Promise<AvailabilityResult> {
  const slots = await availabilityService.getSlotsForDate(restaurantId, date);
  const slot = slots.find((s) => s.time === time);

  if (!slot) {
    return { available: false, availableSeats: 0, totalSeats: 0, reason: "Orario non disponibile" };
  }
  if (slot.availableSeats <= 0) {
    return { available: false, availableSeats: 0, totalSeats: slot.totalSeats, reason: "Slot esaurito" };
  }
  if (guests > slot.availableSeats) {
    return {
      available: false,
      availableSeats: slot.availableSeats,
      totalSeats: slot.totalSeats,
      reason: `Solo ${slot.availableSeats} post${slot.availableSeats === 1 ? "o" : "i"} disponibil${slot.availableSeats === 1 ? "e" : "i"} per questo orario`,
    };
  }

  return { available: true, availableSeats: slot.availableSeats, totalSeats: slot.totalSeats };
}

export async function getSlotsForDate(
  restaurantId: string,
  date: string
): Promise<Array<{ time: string; availableSeats: number; totalSeats: number; discount?: number; label?: string }>> {
  return availabilityService.getSlotsForDate(restaurantId, date);
}

// ── 2. Crea prenotazione ─────────────────────────────────────────────────────

export async function createBooking(
  formData: BookingFormData,
  customerId: string
): Promise<ClientBooking> {
  const availability = await checkAvailability(
    formData.restaurantId,
    formData.date,
    formData.time,
    formData.guests
  );
  if (!availability.available) {
    throw new Error(availability.reason ?? "Slot non disponibile");
  }

  const supabase = createClient();

  const { data: existing, error: existingErr } = await supabase
    .from("bookings")
    .select("id")
    .eq("restaurant_id", formData.restaurantId)
    .eq("customer_id", customerId)
    .eq("date", formData.date)
    .eq("start_time", formData.time)
    .neq("status", "cancelled")
    .maybeSingle();
  if (existingErr) throw new Error(existingErr.message);
  if (existing) throw new Error("Hai già una prenotazione per questo orario in questo locale");

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      restaurant_id: formData.restaurantId,
      customer_id: customerId,
      date: formData.date,
      start_time: formData.time,
      guests: formData.guests,
      status: "confirmed", // mock: auto-confermata, nessuna approvazione manuale del locale per ora
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone,
      special_requests: formData.specialRequests,
      deposit_required: false,
      confirmed_at: now,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const row = data as unknown as BookingRow;
  const restaurants = await attachRestaurants([row]);
  return mapRow(row, restaurants.get(row.restaurant_id));
}

// ── 3. Cancella prenotazione ─────────────────────────────────────────────────

export async function cancelBooking(
  bookingId: string,
  requesterId: string,
  reason?: string
): Promise<ClientBooking> {
  void requesterId; // l'autorizzazione è già garantita dalle RLS (cliente proprio booking o commerciante proprio locale)
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancel_reason: reason })
    .eq("id", bookingId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as unknown as BookingRow;
  const restaurants = await attachRestaurants([row]);
  return mapRow(row, restaurants.get(row.restaurant_id));
}

// ── 4. Aggiorna stato (commerciante) ─────────────────────────────────────────

export async function updateStatus(
  bookingId: string,
  status: BookingStatus,
  reason?: string
): Promise<ClientBooking> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status,
      ...(status === "confirmed" ? { confirmed_at: now } : {}),
      ...(status === "cancelled" ? { cancelled_at: now, cancel_reason: reason } : {}),
    })
    .eq("id", bookingId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as unknown as BookingRow;
  const restaurants = await attachRestaurants([row]);
  return mapRow(row, restaurants.get(row.restaurant_id));
}

// ── 5. Storico cliente ───────────────────────────────────────────────────────

export async function fetchClientBookings(customerId: string): Promise<ClientBooking[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as BookingRow[];
  const restaurants = await attachRestaurants(rows);
  return rows.map((r) => mapRow(r, restaurants.get(r.restaurant_id)));
}

// ── 6. Storico commerciante ──────────────────────────────────────────────────

export async function fetchMerchantBookings(restaurantIds: string[]): Promise<MerchantBookingView[]> {
  if (restaurantIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .in("restaurant_id", restaurantIds)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as BookingRow[];
  const restaurants = await attachRestaurants(rows);
  return rows.map((r) => mapRow(r, restaurants.get(r.restaurant_id)));
}

// ── 7. Singola prenotazione ──────────────────────────────────────────────────

export async function fetchBookingById(id: string): Promise<ClientBooking | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as unknown as BookingRow;
  const restaurants = await attachRestaurants([row]);
  return mapRow(row, restaurants.get(row.restaurant_id));
}
