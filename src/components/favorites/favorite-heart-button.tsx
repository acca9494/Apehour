"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { isFavorite, toggleFavorite } from "@/lib/favorites/service";

export function FavoriteHeartButton({ restaurantId, restaurantSlug }: { restaurantId: string; restaurantSlug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) isFavorite(user.id, restaurantId).then(setSaved).catch(() => {});
  }, [user, restaurantId]);

  async function handleClick() {
    if (!user) {
      router.push(`/login?from=${encodeURIComponent(`/restaurants/${restaurantSlug}`)}`);
      return;
    }
    const next = await toggleFavorite(user.id, restaurantId);
    setSaved(next);
  }

  return (
    <button
      type="button"
      className={`detail-back-btn detail-hero__favorite-btn${saved ? " is-saved" : ""}`}
      onClick={handleClick}
      aria-label={saved ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
      aria-pressed={saved}
    >
      <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
