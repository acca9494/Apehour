"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";
import { RestaurantCard } from "@/components/restaurant-card";
import { getFavorites } from "@/lib/favorites/store";
import { restaurants } from "@/lib/data/restaurants";

export function FavoritesClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?from=/favorites");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) setSlugs(getFavorites(user.id));
  }, [user]);

  if (loading || !user) return null;

  const saved = restaurants.filter((r) => slugs.includes(r.slug));

  if (saved.length === 0) {
    return (
      <div className="route-shell state-route">
        <div className="state-panel">
          <p className="eyebrow">Preferiti</p>
          <h2>Nessun locale salvato</h2>
          <p>
            Salva i bar che ti piacciono per ritrovarli facilmente e prenotare in un tap.
          </p>
          <div className="state-panel__actions">
            <ClayLink href="/search">Esplora locali</ClayLink>
            <ClayLink href="/profile" variant="secondary">
              Torna al profilo
            </ClayLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results" style={{ padding: "2.5rem 1.75rem" }}>
      <p className="eyebrow">Preferiti</p>
      <h1 style={{ marginBottom: "1.5rem" }}>I tuoi locali salvati</h1>
      <div className="search-grid">
        {saved.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </div>
  );
}
