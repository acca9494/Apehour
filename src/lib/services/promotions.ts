import { getAllActiveOffers } from "@/lib/offers/service";
import type { Promotion } from "@/lib/types";

// Offerte reali (tabella public.offers, create dai locali in dashboard),
// non più un elenco statico scritto a mano.
export async function getPromotions(limit = 8): Promise<Promotion[]> {
  const offers = await getAllActiveOffers();
  return offers.slice(0, limit).map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    discount: o.discount,
    restaurantSlug: o.restaurantSlug,
    apeType: o.apeType,
  }));
}
