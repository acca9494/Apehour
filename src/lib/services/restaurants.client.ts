import type { Restaurant, SearchFilters, Cuisine, BookingSlot } from "@/lib/types";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { getAllActiveRestaurants, getRestaurantBySlug as getRestaurantRowBySlug, type RestaurantRow } from "@/lib/restaurants/service";

interface ScheduleRow {
  id: string;
  restaurant_id: string;
  start_time: string;
  label: string | null;
  total_seats: number;
  discount_percent: number | null;
}

function mapRow(row: RestaurantRow, slots: BookingSlot[] = []): Restaurant {
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
    openingHours: [],
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

    return matchesCity && matchesCuisine;
  });
}

export async function getRestaurantsClient(filters?: SearchFilters): Promise<Restaurant[]> {
  const rows = await getAllActiveRestaurants();
  const ids = rows.map((r) => r.id);

  let slotsByRestaurant = new Map<string, BookingSlot[]>();
  if (ids.length > 0) {
    const supabase = createBrowserClient();
    const { data: scheduleRows, error: schedErr } = await supabase
      .from("availability_schedules")
      .select("id, restaurant_id, start_time, label, total_seats, discount_percent")
      .in("restaurant_id", ids)
      .eq("is_active", true);
    if (schedErr) throw new Error(schedErr.message);
    slotsByRestaurant = groupSlotsByRestaurant((scheduleRows ?? []) as ScheduleRow[]);
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
