"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { cancelBooking, fetchClientBookings } from "@/lib/bookings/service";
import { ClayButton, ClayLink } from "@/components/ui/clay-button";
import type { ClientBooking } from "@/lib/bookings/types";

const STATUS_LABEL: Record<string, string> = {
  pending:   "In attesa",
  confirmed: "Confermata",
  cancelled: "Annullata",
  completed: "Completata",
  no_show:   "No-show",
};

const FILTER_TABS = [
  { key: "all",      label: "Tutte" },
  { key: "upcoming", label: "In arrivo" },
  { key: "past",     label: "Passate" },
] as const;

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function isPast(dateStr: string, timeStr: string): boolean {
  return new Date(`${dateStr}T${timeStr}`) < new Date();
}

export function ClientBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setBookings(await fetchClientBookings(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(bookingId: string) {
    if (!user) return;
    if (!confirm("Annullare questa prenotazione?")) return;
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId, user.id, "Annullata dal cliente");
      await load();
    } finally {
      setCancelling(null);
    }
  }

  const filtered = bookings.filter((b) => {
    if (filter === "upcoming") return !isPast(b.date, b.time) && b.status !== "cancelled";
    if (filter === "past")     return isPast(b.date, b.time) || b.status === "cancelled";
    return true;
  });

  const upcoming = bookings.filter((b) => !isPast(b.date, b.time) && b.status === "confirmed").length;
  const past     = bookings.filter((b) => isPast(b.date, b.time)).length;

  return (
    <div className="user-bookings">
      <div className="dashboard-page-header">
        <p className="eyebrow">Prenotazioni</p>
        <h1>Storico e prossime visite</h1>
        <p>Tutte le tue prenotazioni in un unico posto.</p>
      </div>

      {/* Summary */}
      <div className="avail-summary-bar">
        <div className="avail-summary-item">
          <strong>{bookings.length}</strong>
          <span>Totali</span>
        </div>
        <div className="avail-summary-item">
          <strong>{upcoming}</strong>
          <span>In arrivo</span>
        </div>
        <div className="avail-summary-item">
          <strong>{past}</strong>
          <span>Passate</span>
        </div>
        <ClayLink href="/search" variant="primary" className="avail-summary__cta">
          + Prenota
        </ClayLink>
      </div>

      {/* Filter tabs */}
      <div className="mbk-tabs" style={{ marginBottom: "0" }}>
        {FILTER_TABS.map((t) => {
          const count =
            t.key === "all"      ? bookings.length :
            t.key === "upcoming" ? bookings.filter((b) => !isPast(b.date, b.time) && b.status !== "cancelled").length :
                                   bookings.filter((b) => isPast(b.date, b.time) || b.status === "cancelled").length;
          return (
            <button
              key={t.key}
              type="button"
              className={`mbk-tab${filter === t.key ? " is-active" : ""}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              <span className="mbk-tab__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="dash-table-card">
        {loading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : filtered.length === 0 ? (
          <div className="dash-empty">
            <p>Nessuna prenotazione{filter !== "all" ? " in questa categoria" : ""}.</p>
            {filter === "all" && (
              <div style={{ marginTop: "0.75rem" }}>
                <ClayLink href="/search">Prenota il tuo primo aperitivo</ClayLink>
              </div>
            )}
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Locale</th>
                <th>Data · Ora</th>
                <th>Ospiti</th>
                <th>Stato</th>
                <th>Rif.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const past = isPast(b.date, b.time);
                const cancellable = b.status === "confirmed" && !past;
                return (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/restaurants/${b.restaurantSlug}`} className="dash-table__name">
                        {b.restaurantName}
                      </Link>
                      <div className="dash-table__email">{b.restaurantCity}</div>
                    </td>
                    <td>
                      <div className="dash-table__name">{formatDate(b.date)}</div>
                      <div className="dash-table__email">{b.time}</div>
                    </td>
                    <td className="dash-table__center">{b.guests}</td>
                    <td>
                      <span className={`dash-badge dash-badge--${b.status}`}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="dash-table__ref">{b.bookingRef}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        {cancellable && (
                          <Link
                            href={`/booking?restaurant=${b.restaurantSlug}&date=${b.date}&time=${b.time}&guests=${b.guests}&modifyId=${b.id}`}
                            className="mbk-action-btn"
                          >
                            Modifica
                          </Link>
                        )}
                        {cancellable && (
                          <button
                            type="button"
                            className="dash-action-btn dash-action-btn--reject"
                            disabled={cancelling === b.id}
                            onClick={() => handleCancel(b.id)}
                          >
                            {cancelling === b.id ? "…" : "Annulla"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
