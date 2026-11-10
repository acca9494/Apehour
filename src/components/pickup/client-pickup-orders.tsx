"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { fetchClientPickupOrders, cancelPickupOrder } from "@/lib/pickup/service";
import { ClayLink } from "@/components/ui/clay-button";
import type { ClientPickupOrder } from "@/lib/pickup/types";

const STATUS_LABEL: Record<string, string> = {
  richiesto: "In preparazione",
  pronto:    "Pronto — vai a ritirarlo!",
  ritirato:  "Ritirato",
  annullato: "Annullato",
};

// Si aggiorna da sola solo mentre questa pagina resta aperta (nessuna
// notifica push vera): se il cliente la chiude, al rientro su "I miei
// ordini" vede comunque lo stato più recente, letto di nuovo dal database.
const POLL_MS = 8000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

export function ClientPickupOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ClientPickupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setOrders(await fetchClientPickupOrders(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  async function handleCancel(orderId: string) {
    if (!confirm("Annullare questo ordine?")) return;
    setCancelling(orderId);
    try {
      await cancelPickupOrder(orderId);
      await load();
    } finally {
      setCancelling(null);
    }
  }

  const active = orders.filter((o) => o.status === "richiesto" || o.status === "pronto");

  return (
    <div className="user-bookings">
      <div className="dashboard-page-header">
        <p className="eyebrow">Ritiri</p>
        <h1>I miei ordini</h1>
        <p>Ordini da ritirare di persona nei locali che hanno questo servizio.</p>
      </div>

      <div className="dash-table-card">
        {loading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : orders.length === 0 ? (
          <div className="dash-empty">
            <p>Nessun ordine ancora.</p>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Locale</th>
                <th>Ordine</th>
                <th>Codice</th>
                <th>Stato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cancellable = o.status === "richiesto";
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/restaurants/${o.restaurantSlug}`} className="dash-table__name">
                        {o.restaurantName}
                      </Link>
                      <div className="dash-table__email">{formatTime(o.requestedAt)}</div>
                    </td>
                    <td>{o.itemDescription}</td>
                    <td className="dash-table__ref">{o.orderRef}</td>
                    <td>
                      <span className={`dash-badge dash-badge--${o.status === "pronto" ? "confirmed" : o.status === "annullato" ? "cancelled" : "pending"}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td>
                      {cancellable && (
                        <button
                          type="button"
                          className="dash-action-btn dash-action-btn--reject"
                          disabled={cancelling === o.id}
                          onClick={() => handleCancel(o.id)}
                        >
                          {cancelling === o.id ? "…" : "Annulla"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {active.length === 0 && orders.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <ClayLink href="/search">Scopri i locali</ClayLink>
        </div>
      )}
    </div>
  );
}
