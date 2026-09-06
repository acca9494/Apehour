import { createClient } from "@/lib/supabase/client";

export async function getFavoriteRestaurantIds(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("restaurant_id")
    .eq("customer_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.restaurant_id as string);
}

export async function isFavorite(userId: string, restaurantId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("customer_id", userId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

export async function toggleFavorite(userId: string, restaurantId: string): Promise<boolean> {
  const supabase = createClient();
  const already = await isFavorite(userId, restaurantId);
  if (already) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("customer_id", userId)
      .eq("restaurant_id", restaurantId);
    if (error) throw new Error(error.message);
    return false;
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({ customer_id: userId, restaurant_id: restaurantId });
    if (error) throw new Error(error.message);
    return true;
  }
}

export async function getFavoritesCountForRestaurant(restaurantId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}
