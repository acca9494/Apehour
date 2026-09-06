import type { Restaurant, SearchFilters, Cuisine, BookingSlot } from "@/lib/types";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { RestaurantRow } from "@/lib/restaurants/service";

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

async function fetchActiveRestaurantsServer(): Promise<Restaurant[]> {
  const supabase = await createServerClient();
  const { data: restaurantRows, error } = await supabase.from("restaurants").select("*").eq("is_active", true);
  if (error) throw new Error(error.message);

  const ids = (restaurantRows ?? []).map((r) => r.id as string);
  const slotsByRestaurant = await (async () => {
    if (ids.length === 0) return new Map<string, BookingSlot[]>();
    const { data: scheduleRows, error: schedErr } = await supabase
      .from("availability_schedules")
      .select("id, restaurant_id, start_time, label, total_seats, discount_percent")
      .in("restaurant_id", ids)
      .eq("is_active", true);
    if (schedErr) throw new Error(schedErr.message);
    return groupSlotsByRestaurant((scheduleRows ?? []) as ScheduleRow[]);
  })();

  return (restaurantRows ?? []).map((row) =>
    mapRow(row as RestaurantRow, slotsByRestaurant.get(row.id as string) ?? [])
  );
}

export async function getRestaurants(filters?: SearchFilters): Promise<Restaurant[]> {
  return applyRestaurantFilters(await fetchActiveRestaurantsServer(), filters);
}

export async function getTrendingRestaurants(): Promise<Restaurant[]> {
  const all = await fetchActiveRestaurantsServer();
  return all.filter((r) => r.rating >= 4.7).slice(0, 4);
}

export async function getTonightRestaurants(): Promise<Restaurant[]> {
  const all = await fetchActiveRestaurantsServer();
  return all.slice(0, 3);
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("restaurants").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: scheduleRows, error: schedErr } = await supabase
    .from("availability_schedules")
    .select("id, restaurant_id, start_time, label, total_seats, discount_percent")
    .eq("restaurant_id", data.id)
    .eq("is_active", true);
  if (schedErr) throw new Error(schedErr.message);

  return mapRow(data as RestaurantRow, groupSlotsByRestaurant((scheduleRows ?? []) as ScheduleRow[]).get(data.id as string) ?? []);
}

export async function getSimilarRestaurants(currentSlug: string): Promise<Restaurant[]> {
  const all = await fetchActiveRestaurantsServer();
  const current = all.find((r) => r.slug === currentSlug);
  if (!current) return all.filter((r) => r.slug !== currentSlug).slice(0, 3);

  return all
    .filter((r) => r.slug !== currentSlug)
    .sort((a, b) => Number(b.cuisine === current.cuisine) - Number(a.cuisine === current.cuisine))
    .slice(0, 3);
}
