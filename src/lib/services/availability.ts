import { restaurants } from "@/lib/data/restaurants";
import type { BookingSlot } from "@/lib/types";
import { mockFetch, mockServerFetch } from "@/lib/services/http";

export async function getAvailability(restaurantId: string): Promise<BookingSlot[]> {
  const restaurant = restaurants.find((item) => item.id === restaurantId);

  return mockServerFetch(restaurant?.slots ?? []);
}

export async function getAvailabilityClient(restaurantId: string): Promise<BookingSlot[]> {
  const restaurant = restaurants.find((item) => item.id === restaurantId);

  return mockFetch(restaurant?.slots ?? []);
}
