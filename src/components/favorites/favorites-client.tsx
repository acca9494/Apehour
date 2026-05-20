"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";

export function FavoritesClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?from=/favorites");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="route-shell state-route">
      <div className="state-panel">
        <p className="eyebrow">Preferiti</p>
        <h2>Nessun locale salvato</h2>
        <p>
          Salva i bar che ti piacciono per ritrovarli facilmente e prenotare in un tap.
          <br />
          La funzione di salvataggio sarà disponibile a breve.
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
