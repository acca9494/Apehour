import { reviews } from "@/lib/data/restaurants";
import type { Review } from "@/lib/types";
import { mockServerFetch } from "@/lib/services/http";

export async function getReviews(restaurantId?: string): Promise<Review[]> {
  const items = restaurantId ? reviews.filter((review) => review.restaurantId === restaurantId) : reviews;

  return mockServerFetch(items);
}
