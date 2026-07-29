function favoritesKey(userId: string) { return `appape_favorites_${userId}`; }

export function getFavorites(userId: string): string[] {
  try {
    const raw = localStorage.getItem(favoritesKey(userId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(userId: string, restaurantSlug: string): boolean {
  return getFavorites(userId).includes(restaurantSlug);
}

export function toggleFavorite(userId: string, restaurantSlug: string): string[] {
  const current = getFavorites(userId);
  const next = current.includes(restaurantSlug)
    ? current.filter((s) => s !== restaurantSlug)
    : [...current, restaurantSlug];
  localStorage.setItem(favoritesKey(userId), JSON.stringify(next));
  return next;
}
