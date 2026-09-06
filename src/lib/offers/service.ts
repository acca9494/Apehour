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

interface PublicOfferRow extends OfferRow {
  restaurants: {
    slug: string;
    name: string;
    cuisine: string;
    address: string | null;
    rating: number;
    review_count: number;
    cover_image_url: string | null;
  } | null;
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

export async function getAllActiveOffers(): Promise<PublicOffer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*, restaurants(slug, name, cuisine, address, rating, review_count, cover_image_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as PublicOfferRow[])
    .filter((row) => row.restaurants)
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      discount: row.discount,
      apeType: row.ape_type ?? undefined,
      restaurantSlug: row.restaurants!.slug,
      restaurantName: row.restaurants!.name,
      restaurantCuisine: row.restaurants!.cuisine,
      restaurantAddress: row.restaurants!.address ?? "",
      restaurantRating: row.restaurants!.rating ?? 0,
      restaurantReviewCount: row.restaurants!.review_count ?? 0,
      restaurantImage: row.restaurants!.cover_image_url ?? "/apeapplogo1.png",
    }));
}
