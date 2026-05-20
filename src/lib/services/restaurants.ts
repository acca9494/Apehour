import { restaurants } from "@/lib/data/restaurants";
import type { Restaurant, SearchFilters } from "@/lib/types";
import { mockFetch, mockServerFetch } from "@/lib/services/http";

function applyRestaurantFilters(items: Restaurant[], filters?: SearchFilters): Restaurant[] {
  if (!filters) {
    return items;
  }

  return items.filter((restaurant) => {
    const matchesCity = filters.city
      ? restaurant.city.toLowerCase().includes(filters.city.toLowerCase()) ||
        restaurant.neighborhood.toLowerCase().includes(filters.city.toLowerCase())
      : true;
    const matchesCuisine =
      filters.cuisine && filters.cuisine !== "All" ? restaurant.cuisine === filters.cuisine : true;

    return matchesCity && matchesCuisine;
  });
}

export async function getRestaurants(filters?: SearchFilters): Promise<Restaurant[]> {
  return mockServerFetch(applyRestaurantFilters(restaurants, filters));
}

export async function getRestaurantsClient(filters?: SearchFilters): Promise<Restaurant[]> {
  return mockFetch(applyRestaurantFilters(restaurants, filters));
}

export async function getTrendingRestaurants(): Promise<Restaurant[]> {
  return mockServerFetch(restaurants.filter((restaurant) => restaurant.rating >= 4.7).slice(0, 4));
}

export async function getTonightRestaurants(): Promise<Restaurant[]> {
  return mockServerFetch(
    restaurants
      .filter((restaurant) => restaurant.slots.some((slot) => slot.availableSeats <= 6))
      .slice(0, 3),
  );
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  return mockServerFetch(restaurants.find((restaurant) => restaurant.slug === slug) ?? null);
}

export async function getSimilarRestaurants(currentSlug: string): Promise<Restaurant[]> {
  const current = restaurants.find((restaurant) => restaurant.slug === currentSlug);

  if (!current) {
    return mockServerFetch(restaurants.slice(0, 3));
  }

  return mockServerFetch(
    restaurants
      .filter((restaurant) => restaurant.slug !== currentSlug)
      .sort((a, b) => Number(b.cuisine === current.cuisine) - Number(a.cuisine === current.cuisine))
      .slice(0, 3),
  );
}
