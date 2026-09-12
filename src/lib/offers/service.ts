import { createClient } from "@/lib/supabase/client";
import type { ApeType, MerchantOffer } from "@/lib/merchant/store";

interface OfferRow {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  discount: number;
  ape_type: ApeType | null;
  is_active: boolean;
  slot_ids: string[];
}

interface PublicRestaurantInfo {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  address: string | null;
  rating: number;
  review_count: number;
  cover_image_url: string | null;
}

export interface PublicOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  apeType?: ApeType;
  restaurantSlug: string;
  restaurantName: string;
  restaurantCuisine: string;
  restaurantAddress: string;
  restaurantRating: number;
  restaurantReviewCount: number;
  restaurantImage: string;
}

function mapMine(row: OfferRow): MerchantOffer {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    discount: row.discount,
    apeType: row.ape_type ?? undefined,
    slotIds: row.slot_ids ?? [],
  };
}

export async function listMyOffers(restaurantId: string): Promise<MerchantOffer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as OfferRow[]).map(mapMine);
}

export async function upsertOffer(offer: MerchantOffer, restaurantId: string): Promise<void> {
  const supabase = createClient();
  const payload = {
    restaurant_id: restaurantId,
    title: offer.title,
    description: offer.description,
    discount: offer.discount,
    ape_type: offer.apeType ?? null,
    slot_ids: offer.slotIds,
  };
  // id generati dal form mock ("offer-<timestamp>") non sono UUID validi: se non è
  // un UUID vero, trattalo sempre come nuova offerta invece di un update per id.
  const isRealId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(offer.id);
  if (isRealId) {
    const { error } = await supabase.from("offers").update(payload).eq("id", offer.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("offers").insert(payload);
    if (error) throw new Error(error.message);
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Nota: niente embedding "offers.restaurants(...)" — quel join passa comunque
// dalla tabella restaurants, che non ha più una policy SELECT pubblica (per
// non esporre iban/vat_number/legal_name). Il locale va letto separatamente
// dalla vista pubblica restaurants_public.
export async function getAllActiveOffers(): Promise<PublicOffer[]> {
  const supabase = createClient();
  const { data: offers, error } = await supabase
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (offers ?? []) as OfferRow[];
  if (rows.length === 0) return [];

  const restaurantIds = [...new Set(rows.map((r) => r.restaurant_id))];
  const { data: restaurants, error: rErr } = await supabase
    .from("restaurants_public")
    .select("id, slug, name, cuisine, address, rating, review_count, cover_image_url")
    .in("id", restaurantIds);
  if (rErr) throw new Error(rErr.message);
  const byId = new Map((restaurants as PublicRestaurantInfo[] ?? []).map((r) => [r.id, r]));

  return rows
    .map((row) => ({ row, restaurant: byId.get(row.restaurant_id) }))
    .filter((x): x is { row: OfferRow; restaurant: PublicRestaurantInfo } => !!x.restaurant)
    .map(({ row, restaurant }) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      discount: row.discount,
      apeType: row.ape_type ?? undefined,
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,
      restaurantCuisine: restaurant.cuisine,
      restaurantAddress: restaurant.address ?? "",
      restaurantRating: restaurant.rating ?? 0,
      restaurantReviewCount: restaurant.review_count ?? 0,
      restaurantImage: restaurant.cover_image_url ?? "/apeapplogo1.png",
    }));
}
