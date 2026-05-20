import { restaurants } from "@/lib/data/restaurants";
import { mockServerFetch } from "@/lib/services/http";

export async function getMapPreview(restaurantId: string): Promise<{
  provider: "placeholder";
  embedLabel: string;
  coordinates: { lat: number; lng: number };
}> {
  const restaurant = restaurants.find((item) => item.id === restaurantId);

  return mockServerFetch({
    provider: "placeholder",
    embedLabel: restaurant ? `${restaurant.neighborhood}, ${restaurant.city}` : "Restaurant area",
    coordinates: restaurant?.coordinates ?? { lat: 0, lng: 0 },
  });
}
