import { createClient as createServerClient } from "@/lib/supabase/server";

export interface RestaurantOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
}

// Offerte attive di UN locale, per la sezione "Promozioni attive" nella sua
// pagina pubblica (distinta dalla vetrina generale /offers con tutti i locali).
export async function getActiveOffersForRestaurant(restaurantId: string): Promise<RestaurantOffer[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id, title, description, discount")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    discount: row.discount,
  }));
}
