"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { fetchMerchantBookings, updateStatus } from "@/lib/bookings/service";
import { restaurants } from "@/lib/data/restaurants";
import type { BookingStatus, MerchantBookingView } from "@/lib/bookings/types";

const ALL_STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed", "no_show"];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending:   "In attesa",
  confirmed: "Confermata",
  cancelled: "Annullata",
  completed: "Completata",
  no_show:   "No-show",
};

const NEXT_STATUS: Record<string, BookingStatus[]> = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  cancelled: [],
  no_show:   [],
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function MerchantBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<MerchantBookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  // In a real app, we'd fetch only restaurants owned by this merchant.
  // Mock: use all restaurants as if they belong to this commerciante.
  const merchantRestaurantIds = restaurants.map((r) => r.id);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMerchantBookings(merchantRestaurantIds);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(bookingId: string, newStatus: BookingStatus) {
    setUpdatingId(bookingId);
    try {
      await updateStatus(bookingId, newStatus);
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const counts = ALL_STATUSES.reduce(
    (acc, s) => { acc[s] = bookings.filter((b) => b.status === s).length; return acc; },
    {} as Record<BookingStatus, number>
  );

  return (
    <div>
      <div className="dashboard-page-header">
        <p className="eyebrow">Gestione</p>
        <h1>Prenotazioni</h1>
        <p>Tutte le prenotazioni dei tuoi locali, in ordine cronologico.</p>
      </div>

      {/* Filtri per stato */}
      <div className="mbk-filters">
        <button
          type="button"
          className={`cbk-filter-btn${filter === "all" ? " is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tutte ({bookings.length})
        </button>
        {ALL_STATUSES.filter((s) => counts[s] > 0 || s === "pending" || s === "confirmed").map((s) => (
          <button
            key={s}
            type="button"
            className={`cbk-filter-btn${filter === s ? " is-active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABEL[s]} {counts[s] > 0 ? `(${counts[s]})` : ""}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "var(--white-50)" }}>Caricamento…</p>}

      {!loading && filtered.length === 0 && (
        <div className="dash-table-card">
          <p style={{ color: "var(--white-50)", margin: 0 }}>
            Nessuna prenotazione {filter !== "all" ? `con stato "${STATUS_LABEL[filter as BookingStatus]}"` : ""}.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="dash-table-card">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Cliente</th>
                <th>Locale</th>
                <th>Data / Ora</th>
                <th>Ospiti</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--white-50)", fontSize: "0.78rem" }}>
                    {b.bookingRef}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{b.customerName}</div>
                    <div style={{ color: "var(--white-50)", fontSize: "0.78rem" }}>{b.customerEmail}</div>
                  </td>
                  <td style={{ color: "var(--white-80)" }}>{b.restaurantName}</td>
                  <td>
                    <div>{formatDate(b.date)}</div>
                    <div style={{ color: "var(--white-50)", fontSize: "0.82rem" }}>{b.time}</div>
                  </td>
                  <td style={{ textAlign: "center" }}>{b.guests}</td>
                  <td>
                    <span className={`dash-badge dash-badge--${b.status === "confirmed" ? "confirmed" : b.status === "pending" ? "pending" : "cancelled"}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {NEXT_STATUS[b.status].map((nextStatus) => (
                        <button
                          key={nextStatus}
                          type="button"
                          className="mbk-action-btn"
                          disabled={updatingId === b.id}
                          onClick={() => handleStatusChange(b.id, nextStatus)}
                        >
                          {nextStatus === "confirmed"  ? "Conferma" :
                           nextStatus === "cancelled"  ? "Annulla"  :
                           nextStatus === "completed"  ? "Completata" :
                           nextStatus === "no_show"    ? "No-show"  : nextStatus}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
