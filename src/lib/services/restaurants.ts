import { restaurants } from "@/lib/data/restaurants";
import type { Restaurant, SearchFilters } from "@/lib/types";
import { mockFetch, mockServerFetch } from "@/lib/services/http";

function applyRestaurantFilters(items: Restaurant[], filters?: SearchFilters): Restaurant[] {
  if (!filters) {
    return items;
  }

  return items.filter((restaurant) => {
    const matchesCity = filters.city
      ? (() => {
          const CITY_ALIASES: Record<string, string[]> = {
            milan: ["milano", "milan"],
            rome: ["roma", "rome"],
            florence: ["firenze", "florence"],
            venice: ["venezia", "venice"],
            naples: ["napoli", "naples"],
            turin: ["torino", "turin"],
            bologna: ["bologna"],
            barcelona: ["barcelona", "barcellona"],
            paris: ["paris", "parigi"],
            london: ["london", "londra"],
          };
          const q = filters.city.toLowerCase().trim();
          const dataCity = restaurant.city.toLowerCase();
          const dataNeighborhood = restaurant.neighborhood.toLowerCase();
          const aliases = Object.values(CITY_ALIASES).find((group) => group.includes(dataCity)) ?? [dataCity];
          return aliases.some((a) => a.includes(q) || q.includes(a)) ||
            dataNeighborhood.includes(q) || q.includes(dataNeighborhood);
        })()
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
