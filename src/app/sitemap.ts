import type { MetadataRoute } from "next";
import { getRestaurants } from "@/lib/services/restaurants";
import { getAllActiveEvents } from "@/lib/events/service";

const SITE_URL = "https://apehour.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/events`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/offers`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/attivita`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/come-funziona`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/register`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [restaurants, events] = await Promise.all([
    getRestaurants().catch(() => []),
    getAllActiveEvents().catch(() => []),
  ]);

  const restaurantPages: MetadataRoute.Sitemap = restaurants.map((r) => ({
    url: `${SITE_URL}/restaurants/${r.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}/events/${e.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...restaurantPages, ...eventPages];
}
