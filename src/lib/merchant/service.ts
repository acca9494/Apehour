// ─────────────────────────────────────────────────────────────────────────────
//  Merchant service — operazioni lato commerciante
//  Supabase: ogni funzione ha l'equivalente query nel commento.
// ─────────────────────────────────────────────────────────────────────────────

import {
  getAvailability,
  getTables,
  getVenueSettings,
  saveAvailability,
  saveTables,
  saveVenueSettings,
  upsertTable,
  deleteTable as storeDeleteTable,
  type DayConfig,
  type MerchantTable,
  type VenueSettings,
} from "./store";

function simulateLatency(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Tavoli ───────────────────────────────────────────────────────────────────
// Supabase: SELECT * FROM tables WHERE restaurant_id = $1

export async function fetchTables(userId: string): Promise<MerchantTable[]> {
  await simulateLatency(150);
  return getTables(userId);
}

export async function saveTable(table: MerchantTable, userId: string): Promise<void> {
  await simulateLatency(200);
  upsertTable(table, userId);
}

export async function removeTable(id: string, userId: string): Promise<void> {
  await simulateLatency(150);
  storeDeleteTable(id, userId);
}

export async function updateAllTables(tables: MerchantTable[], userId: string): Promise<void> {
  await simulateLatency(200);
  saveTables(tables, userId);
}

// ── Disponibilità ─────────────────────────────────────────────────────────────
// Supabase: SELECT * FROM availability_slots WHERE restaurant_id = $1

export async function fetchAvailability(userId: string): Promise<DayConfig[]> {
  await simulateLatency(150);
  return getAvailability(userId);
}

export async function updateAvailability(config: DayConfig[], userId: string): Promise<void> {
  await simulateLatency(250);
  saveAvailability(config, userId);
}

// ── Impostazioni locale ───────────────────────────────────────────────────────
// Supabase: SELECT * FROM restaurants WHERE id = $1

export async function fetchVenueSettings(userId: string): Promise<VenueSettings> {
  await simulateLatency(150);
  return getVenueSettings(userId);
}

export async function updateVenueSettings(settings: VenueSettings, userId: string): Promise<void> {
  await simulateLatency(300);
  saveVenueSettings(settings, userId);
}

// ── Stats sintetiche ──────────────────────────────────────────────────────────
// Supabase: SELECT COUNT(*), SUM(guests), ... FROM bookings WHERE restaurant_id = $1

export interface MerchantStats {
  todayTotal: number;
  todayConfirmed: number;
  todayPending: number;
  todayNoShow: number;
  weekTotal: number;
  weekGuests: number;
  occupancyRate: number;    // 0-100
  conversionRate: number;   // confirmed / (confirmed + cancelled)
  depositCollected: number; // €
}

export async function fetchMerchantStats(restaurantIds: string[]): Promise<MerchantStats> {
  await simulateLatency(200);

  const { getAllBookings } = await import("@/lib/bookings/store");
  const all = getAllBookings().filter((b) => restaurantIds.includes(b.restaurantId));

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const todayBookings = all.filter((b) => b.date === today);
  const weekBookings = all.filter((b) => b.date >= weekAgo);

  const confirmed = all.filter((b) => b.status === "confirmed" || b.status === "completed").length;
  const cancelled = all.filter((b) => b.status === "cancelled").length;
  const total = confirmed + cancelled;

  return {
    todayTotal: todayBookings.length,
    todayConfirmed: todayBookings.filter((b) => b.status === "confirmed").length,
    todayPending: todayBookings.filter((b) => b.status === "pending").length,
    todayNoShow: todayBookings.filter((b) => b.status === "no_show").length,
    weekTotal: weekBookings.length,
    weekGuests: weekBookings.reduce((s, b) => s + b.guests, 0),
    occupancyRate: weekBookings.length > 0 ? Math.round((confirmed / Math.max(total, 1)) * 100) : 84,
    conversionRate: total > 0 ? Math.round((confirmed / total) * 100) : 92,
    depositCollected: all.filter((b) => b.depositPaid).reduce((s, b) => s + (b.depositAmount ?? 0), 0),
  };
}
