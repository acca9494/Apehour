"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { fetchMerchantPickupOrders, markPickupOrderReady, markPickupOrderPickedUp } from "@/lib/pickup/service";
import { ensureRestaurantForOwner } from "@/lib/restaurants/service";
import type { MerchantPickupOrderView, PickupOrderStatus } from "@/lib/pickup/types";

const STATUS_LABEL: Record<PickupOrderStatus, string> = {
  richiesto: "Da preparare",
  pronto:    "Pronto — in attesa del cliente",
  ritirato:  "Ritirato",
  annullato: "Annullato",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

export function MerchantPickupOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MerchantPickupOrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "all">("active");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const restaurant = await ensureRestaurantForOwner(user.id);
      setOrders(restaurant ? await fetchMerchantPickupOrders(restaurant.id) : []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function handleReady(orderId: string) {
    setUpdatingId(orderId);
    try {
      await markPickupOrderReady(orderId);
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handlePickedUp(orderId: string) {
    setUpdatingId(orderId);
    try {
      await markPickupOrderPickedUp(orderId);
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = filter === "active"
    ? orders.filter((o) => o.status === "richiesto" || o.status === "pronto")
    : orders;

  return (
    <div>
      <div className="dashboard-page-header">
        <p className="eyebrow">Buzzer virtuale</p>
        <h1>Ritiri</h1>
        <p>Ordini dei clienti seduti fuori — segna quando è pronto, lo ritirano loro.</p>
      </div>

      <div className="mbk-filters">
        <button type="button" className={`cbk-filter-btn${filter === "active" ? " is-active" : ""}`} onClick={() => setFilter("active")}>
          Da gestire
        </button>
        <button type="button" className={`cbk-filter-btn${filter === "all" ? " is-active" : ""}`} onClick={() => setFilter("all")}>
          Tutti
        </button>
      </div>

      <div className="dash-table-card">
        {loading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : filtered.length === 0 ? (
          <div className="dash-empty"><p>Nessun ordine{filter === "active" ? " da gestire" : ""}.</p></div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Ora</th>
                <th>Codice</th>
                <th>Cosa</th>
                <th>Contatto</th>
                <th>Stato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>{formatTime(o.requestedAt)}</td>
                  <td className="dash-table__ref">{o.orderRef}</td>
                  <td>{o.itemDescription}</td>
                  <td>
                    <div className="dash-table__name">{o.customerName}</div>
                    <div className="dash-table__email">{o.customerPhone}</div>
                  </td>
                  <td>
                    <span className={`dash-badge dash-badge--${o.status === "pronto" ? "confirmed" : o.status === "annullato" ? "cancelled" : "pending"}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      {o.status === "richiesto" && (
                        <button
                          type="button"
                          className="dash-action-btn dash-action-btn--confirm"
                          disabled={updatingId === o.id}
                          onClick={() => handleReady(o.id)}
                        >
                          {updatingId === o.id ? "…" : "Segna pronto"}
                        </button>
                      )}
                      {o.status === "pronto" && (
                        <button
                          type="button"
                          className="dash-action-btn dash-action-btn--confirm"
                          disabled={updatingId === o.id}
                          onClick={() => handlePickedUp(o.id)}
                        >
                          {updatingId === o.id ? "…" : "Ritirato"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
