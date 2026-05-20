import { promotions } from "@/lib/data/restaurants";
import type { Promotion } from "@/lib/types";
import { mockServerFetch } from "@/lib/services/http";

export async function getPromotions(): Promise<Promotion[]> {
  return mockServerFetch(promotions);
}
