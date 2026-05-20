// ─────────────────────────────────────────────────────────────────────────────
//  Booking localStorage store (mock — sostituire con Supabase)
//
//  Supabase: sostituire ogni funzione con le query su public.bookings
//  e public.availability_slots (vedere database-schema.sql).
// ─────────────────────────────────────────────────────────────────────────────

import type { ClientBooking, BookingStatus } from "./types";

const KEY = "appape_bookings";

export function getAllBookings(): ClientBooking[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ClientBooking[]) : [];
  } catch {
    return [];
  }
}

function saveAll(bookings: ClientBooking[]): void {
  localStorage.setItem(KEY, JSON.stringify(bookings));
}

export function getBookingById(id: string): ClientBooking | null {
  return getAllBookings().find((b) => b.id === id) ?? null;
}

export function getClientBookings(customerId: string): ClientBooking[] {
  return getAllBookings()
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Tutti i booking per i locali di un commerciante (nel mock: per restaurantId)
export function getMerchantBookings(restaurantIds: string[]): ClientBooking[] {
  return getAllBookings()
    .filter((b) => restaurantIds.includes(b.restaurantId))
    .sort((a, b) => {
      // Prima per data, poi per orario
      const dateCompare = b.date.localeCompare(a.date);
      return dateCompare !== 0 ? dateCompare : b.time.localeCompare(a.time);
    });
}

// Quanti posti sono già prenotati per un certo slot (esclude cancellati)
export function getBookedSeatsForSlot(
  restaurantId: string,
  date: string,
  time: string
): number {
  return getAllBookings()
    .filter(
      (b) =>
        b.restaurantId === restaurantId &&
        b.date === date &&
        b.time === time &&
        b.status !== "cancelled"
    )
    .reduce((sum, b) => sum + b.guests, 0);
}

export function insertBooking(booking: ClientBooking): void {
  const all = getAllBookings();
  all.push(booking);
  saveAll(all);
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus,
  extra?: { cancelReason?: string }
): ClientBooking | null {
  const all = getAllBookings();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  all[idx] = {
    ...all[idx],
    status,
    updatedAt: now,
    ...(status === "confirmed" ? { confirmedAt: now } : {}),
    ...(status === "cancelled"
      ? { cancelledAt: now, cancelReason: extra?.cancelReason }
      : {}),
  };
  saveAll(all);
  return all[idx];
}
