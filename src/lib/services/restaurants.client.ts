import type { Restaurant, SearchFilters, Cuisine, BookingSlot } from "@/lib/types";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { getAllActiveRestaurants, getRestaurantBySlug as getRestaurantRowBySlug, type PublicRestaurantRow } from "@/lib/restaurants/service";

interface ScheduleRow {
  id: string;
  restaurant_id: string;
  start_time: string;
  label: string | null;
  total_seats: number;
  discount_percent: number | null;
}

function mapRow(row: PublicRestaurantRow, slots: BookingSlot[] = []): Restaurant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    cuisine: row.cuisine as Cuisine,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    priceRange: row.price_range,
    distance: "",
    city: row.city,
    neighborhood: row.neighborhood ?? row.city,
    address: row.address ?? "",
    heroImage: row.cover_image_url ?? "/apeapplogo1.png",
    gallery: row.cover_image_url ? [row.cover_image_url] : [],
    discount: undefined,
    urgencyLabel: row.urgency_label ?? "",
    socialProof: row.social_proof ?? "",
    description: row.description ?? "",
    tags: row.tags ?? [],
    menuPreview: [],
    openingHours: row.opening_hours ?? [],
    coordinates: { lat: row.lat ?? 0, lng: row.lng ?? 0 },
    slots,
  };
}

function groupSlotsByRestaurant(rows: ScheduleRow[]): Map<string, BookingSlot[]> {
  const byRestaurant = new Map<string, BookingSlot[]>();
  for (const r of rows) {
    const slot: BookingSlot = {
      id: r.id,
      time: r.start_time.slice(0, 5),
      label: r.label ?? undefined,
      availableSeats: r.total_seats,
      discount: r.discount_percent ?? undefined,
    };
    const list = byRestaurant.get(r.restaurant_id) ?? [];
    list.push(slot);
    byRestaurant.set(r.restaurant_id, list);
  }
  return byRestaurant;
}

function applyRestaurantFilters(items: Restaurant[], filters?: SearchFilters): Restaurant[] {
  if (!filters) {
    return items;
  }

  return items.filter((restaurant) => {
    const matchesCity = filters.city
      ? (() => {
          const q = filters.city!.toLowerCase().trim();
          const dataCity = restaurant.city.toLowerCase();
          const dataNeighborhood = restaurant.neighborhood.toLowerCase();
          return dataCity.includes(q) || q.includes(dataCity) ||
            dataNeighborhood.includes(q) || q.includes(dataNeighborhood);
        })()
      : true;
    const matchesCuisine =
      filters.cuisine && filters.cuisine !== "All" ? restaurant.cuisine === filters.cuisine : true;
    // Data/ospiti sono già stati usati per calcolare quali slot mostrare
    // (vedi getRestaurantsClient): qui basta escludere chi non ne ha più nessuno.
    const matchesAvailability = filters.date ? restaurant.slots.length > 0 : true;

    return matchesCity && matchesCuisine && matchesAvailability;
  });
}

const JS_DAY_TO_KEY = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"] as const;

export async function getRestaurantsClient(filters?: SearchFilters): Promise<Restaurant[]> {
  const rows = await getAllActiveRestaurants();
  const ids = rows.map((r) => r.id);

  let slotsByRestaurant = new Map<string, BookingSlot[]>();
  if (ids.length > 0) {
    const supabase = createBrowserClient();
    const date = filters?.date;

    let scheduleQuery = supabase
      .from("availability_schedules")
      .select("id, restaurant_id, start_time, label, total_seats, discount_percent, days_of_week")
      .in("restaurant_id", ids)
      .eq("is_active", true);
    if (date) {
      const dayKey = JS_DAY_TO_KEY[new Date(`${date}T00:00:00`).getDay()]!;
      scheduleQuery = scheduleQuery.contains("days_of_week", [dayKey]);
    }
    const { data: scheduleRows, error: schedErr } = await scheduleQuery;
    if (schedErr) throw new Error(schedErr.message);

    // Senza una data scelta non c'è un "oggi occupato" da sottrarre: mostriamo
    // la capienza piena della ricorrenza settimanale, come indicazione generica.
    let bookedByRestaurantTime = new Map<string, number>();
    if (date) {
      const { data: occupancy, error: occErr } = await supabase
        .from("booking_occupancy")
        .select("restaurant_id, start_time, booked_guests")
        .in("restaurant_id", ids)
        .eq("date", date);
      if (occErr) throw new Error(occErr.message);
      bookedByRestaurantTime = new Map(
        (occupancy ?? []).map((o) => [`${o.restaurant_id}|${String(o.start_time).slice(0, 5)}`, o.booked_guests as number])
      );
    }

    const effectiveRows = ((scheduleRows ?? []) as (ScheduleRow & { days_of_week: string[] })[])
      .map((r) => {
        if (!date) return r;
        const key = `${r.restaurant_id}|${r.start_time.slice(0, 5)}`;
        const booked = bookedByRestaurantTime.get(key) ?? 0;
        return { ...r, total_seats: Math.max(r.total_seats - booked, 0) };
      })
      .filter((r) => r.total_seats > 0 && (!filters?.guests || r.total_seats >= filters.guests));

    slotsByRestaurant = groupSlotsByRestaurant(effectiveRows);
  }

  const restaurantsList = rows.map((row) => mapRow(row, slotsByRestaurant.get(row.id) ?? []));
  return applyRestaurantFilters(restaurantsList, filters);
}

export async function getRestaurantBySlugClient(slug: string): Promise<Restaurant | null> {
  const row = await getRestaurantRowBySlug(slug);
  if (!row) return null;

  const supabase = createBrowserClient();
  const { data: scheduleRows, error: schedErr } = await supabase
    .from("availability_schedules")
    .select("id, restaurant_id, start_time, label, total_seats, discount_percent")
    .eq("restaurant_id", row.id)
    .eq("is_active", true);
  if (schedErr) throw new Error(schedErr.message);

  return mapRow(row, groupSlotsByRestaurant((scheduleRows ?? []) as ScheduleRow[]).get(row.id) ?? []);
}
