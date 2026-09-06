// ─────────────────────────────────────────────────────────────────────────────
//  Merchant service — operazioni lato commerciante
//  Supabase: ogni funzione ha l'equivalente query nel commento.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type DayConfig,
  type MerchantTable,
  type MerchantOffer,
  type VenueSettings,
} from "./store";
import { ensureRestaurantForOwner, updateVenueSettingsRow } from "@/lib/restaurants/service";
import * as tablesService from "@/lib/tables/service";
import * as availabilityService from "@/lib/availability/service";
import * as offersService from "@/lib/offers/service";
import { createClient } from "@/lib/supabase/client";

// Legge il locale del commerciante, creandolo al volo se manca ancora
// (es. account appena confermato via email, non ancora passato dalla dashboard).
async function requireRestaurantId(userId: string): Promise<string> {
  const restaurant = await ensureRestaurantForOwner(userId);
  if (!restaurant) throw new Error("Nessun locale associato a questo account. Completa la registrazione del locale.");
  return restaurant.id;
}

// ── Tavoli (Supabase: tabella public.tables, filtrata per restaurant_id) ───────

export async function fetchTables(userId: string): Promise<MerchantTable[]> {
  const restaurantId = await requireRestaurantId(userId);
  return tablesService.listTables(restaurantId);
}

export async function saveTable(table: MerchantTable, userId: string): Promise<void> {
  const restaurantId = await requireRestaurantId(userId);
  await tablesService.upsertTable(table, restaurantId);
}

export async function removeTable(id: string, userId: string): Promise<void> {
  void userId; // mantenuto per compatibilità di firma con i chiamanti esistenti
  await tablesService.deleteTable(id);
}

export async function updateAllTables(tables: MerchantTable[], userId: string): Promise<void> {
  const restaurantId = await requireRestaurantId(userId);
  await Promise.all(tables.map((t) => tablesService.upsertTable(t, restaurantId)));
}

// ── Zone planimetria (Supabase: colonna restaurants.zone_names) ────────────────

export async function fetchZones(userId: string): Promise<string[]> {
  const restaurantId = await requireRestaurantId(userId);
  return tablesService.getZones(restaurantId);
}

export async function addZoneForUser(name: string, userId: string): Promise<string[]> {
  const restaurantId = await requireRestaurantId(userId);
  return tablesService.addZone(name, restaurantId);
}

// ── Disponibilità (Supabase: tabella public.availability_schedules) ────────────

export async function fetchAvailability(userId: string): Promise<DayConfig[]> {
  const restaurantId = await requireRestaurantId(userId);
  return availabilityService.getSchedule(restaurantId);
}

export async function updateAvailability(config: DayConfig[], userId: string): Promise<void> {
  const restaurantId = await requireRestaurantId(userId);
  await availabilityService.saveSchedule(config, restaurantId);
}

// ── Offerte (Supabase: tabella public.offers) ───────────────────────────────────

export async function fetchOffers(userId: string): Promise<MerchantOffer[]> {
  const restaurantId = await requireRestaurantId(userId);
  return offersService.listMyOffers(restaurantId);
}

export async function saveOffer(offer: MerchantOffer, userId: string): Promise<void> {
  const restaurantId = await requireRestaurantId(userId);
  await offersService.upsertOffer(offer, restaurantId);
}

export async function removeOffer(id: string, userId: string): Promise<void> {
  void userId; // mantenuto per compatibilità di firma con i chiamanti esistenti
  await offersService.deleteOffer(id);
}

// ── Impostazioni locale ───────────────────────────────────────────────────────
// Supabase: SELECT * FROM restaurants WHERE id = $1

export async function fetchVenueSettings(userId: string): Promise<VenueSettings> {
  const restaurant = await ensureRestaurantForOwner(userId);
  if (!restaurant) throw new Error("Nessun locale associato a questo account. Completa la registrazione del locale.");
  return {
    restaurantId: restaurant.id,
    name: restaurant.name,
    description: restaurant.description ?? "",
    address: restaurant.address ?? "",
    city: restaurant.city,
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    website: restaurant.website ?? undefined,
    instagram: restaurant.instagram ?? undefined,
    heroImage: restaurant.cover_image_url ?? "",
    deposit: {
      required: restaurant.deposit_required,
      amount: restaurant.deposit_amount ?? 0,
      perPerson: restaurant.deposit_per_person,
      policy: restaurant.deposit_policy ?? "",
    },
  };
}

export async function updateVenueSettings(settings: VenueSettings, userId: string): Promise<void> {
  const restaurantId = await requireRestaurantId(userId);
  await updateVenueSettingsRow(restaurantId, {
    name: settings.name,
    description: settings.description,
    address: settings.address,
    city: settings.city,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    instagram: settings.instagram,
    heroImage: settings.heroImage,
    depositRequired: settings.deposit.required,
    depositAmount: settings.deposit.amount,
    depositPerPerson: settings.deposit.perPerson,
    depositPolicy: settings.deposit.policy,
  });
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
  if (restaurantIds.length === 0) {
    return {
      todayTotal: 0, todayConfirmed: 0, todayPending: 0, todayNoShow: 0,
      weekTotal: 0, weekGuests: 0, occupancyRate: 0, conversionRate: 0, depositCollected: 0,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("date, status, guests")
    .in("restaurant_id", restaurantIds);
  if (error) throw new Error(error.message);

  const all = data ?? [];
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
    occupancyRate: weekBookings.length > 0 ? Math.round((confirmed / Math.max(total, 1)) * 100) : 0,
    conversionRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    depositCollected: 0, // nessun pagamento reale collegato ancora (fase pilota)
  };
}
