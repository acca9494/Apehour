"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";
import { fetchMerchantBookings, updateStatus } from "@/lib/bookings/service";
import { fetchMerchantStats, type MerchantStats } from "@/lib/merchant/service";
import type { MerchantBookingView } from "@/lib/bookings/types";

const MERCHANT_RESTAURANT_IDS = ["rst-001"];

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confermata",
  pending:   "In attesa",
  cancelled: "Annullata",
  completed: "Completata",
  no_show:   "No-show",
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

const QUICK_ACTIONS = [
  { href: "/dashboard/disponibilita", icon: "◷", label: "Disponibilità",  desc: "Aggiorna slot liberi" },
  { href: "/dashboard/tavoli",        icon: "⊞", label: "Tavoli",         desc: "Gestisci i tavoli" },
  { href: "/dashboard/impostazioni",  icon: "◌", label: "Impostazioni",   desc: "Profilo del locale" },
  { href: "/dashboard/pagamenti",     icon: "◎", label: "Pagamenti",      desc: "Storico incassi" },
];

export function DashboardOverview() {
  const { user } = useAuth();

  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [pending, setPending] = useState<MerchantBookingView[]>([]);
  const [recent, setRecent] = useState<MerchantBookingView[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [s, bookings] = await Promise.all([
        fetchMerchantStats(MERCHANT_RESTAURANT_IDS),
        fetchMerchantBookings(MERCHANT_RESTAURANT_IDS),
      ]);
      if (cancelled) return;
      setStats(s);
      setPending(bookings.filter((b) => b.status === "pending"));
      setRecent(
        bookings
          .filter((b) => b.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
          .slice(0, 8)
      );
      setLoadingStats(false);
    }
    load();
    return () => { cancelled = true; };
  }, [today]);

  async function handleAction(bookingId: string, action: "confirmed" | "cancelled") {
    setActionId(bookingId);
    await updateStatus(bookingId, action);
    const [s, bookings] = await Promise.all([
      fetchMerchantStats(MERCHANT_RESTAURANT_IDS),
      fetchMerchantBookings(MERCHANT_RESTAURANT_IDS),
    ]);
    setStats(s);
    setPending(bookings.filter((b) => b.status === "pending"));
    setRecent(
      bookings
        .filter((b) => b.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 8)
    );
    setActionId(null);
  }

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="dash-overview">

      {/* ── Header ──────────────────────────────────── */}
      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">{todayLabel()}</p>
          <h1 className="dash-overview__title">Bentornato, {firstName}</h1>
        </div>
        <ClayLink href="/dashboard/prenotazioni" variant="secondary" className="dash-overview__cta">
          Tutte le prenotazioni
        </ClayLink>
      </div>

      {/* ── KPI Stats ───────────────────────────────── */}
      <div className="dash-kpi-grid">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dash-kpi-card dash-kpi-card--loading" />
          ))
        ) : stats ? (
          <>
            <div className="dash-kpi-card">
              <span className="dash-kpi-card__icon">◈</span>
              <span className="dash-kpi-card__label">Prenotazioni oggi</span>
              <span className="dash-kpi-card__value">{stats.todayTotal}</span>
              <span className="dash-kpi-card__sub">{stats.todayConfirmed} conf · {stats.todayPending} attesa</span>
            </div>
            <div className={`dash-kpi-card${pending.length > 0 ? " dash-kpi-card--urgent" : ""}`}>
              <span className="dash-kpi-card__icon">⚡</span>
              <span className="dash-kpi-card__label">Da confermare</span>
              <span className="dash-kpi-card__value">{pending.length}</span>
              <span className="dash-kpi-card__sub">{pending.length > 0 ? "Azione richiesta" : "Tutto in ordine"}</span>
            </div>
            <div className="dash-kpi-card">
              <span className="dash-kpi-card__icon">◷</span>
              <span className="dash-kpi-card__label">Questa settimana</span>
              <span className="dash-kpi-card__value">{stats.weekTotal}</span>
              <span className="dash-kpi-card__sub">{stats.weekGuests} ospiti totali</span>
            </div>
            <div className="dash-kpi-card">
              <span className="dash-kpi-card__icon">◎</span>
              <span className="dash-kpi-card__label">Occupazione</span>
              <span className="dash-kpi-card__value dash-kpi-card__value--gold">{stats.occupancyRate}%</span>
              <span className="dash-kpi-card__sub">{stats.conversionRate}% conversione</span>
            </div>
          </>
        ) : null}
      </div>

      {/* ── Pending alert ───────────────────────────── */}
      {pending.length > 0 && (
        <div className="dash-pending-alert">
          <div className="dash-pending-alert__header">
            <div>
              <p className="dash-pending-alert__eyebrow">Azione richiesta</p>
              <h2>
                {pending.length} {pending.length === 1 ? "richiesta" : "richieste"} in attesa
                <span className="dash-badge-count">{pending.length}</span>
              </h2>
            </div>
          </div>
          <div className="dash-pending-list">
            {pending.map((b) => (
              <div key={b.id} className="dash-pending-item">
                <div className="dash-avatar-sm">{b.customerName[0].toUpperCase()}</div>
                <div className="dash-pending-item__info">
                  <strong>{b.customerName}</strong>
                  <span>{formatDate(b.date)} · {b.time} · {b.guests} {b.guests === 1 ? "persona" : "persone"}</span>
                  {b.specialRequests && <em className="dash-pending-item__note">{b.specialRequests}</em>}
                </div>
                <span className="dash-pending-item__ref">{b.bookingRef}</span>
                <div className="dash-pending-item__actions">
                  <button
                    className="dash-action-btn dash-action-btn--confirm"
                    disabled={actionId === b.id}
                    onClick={() => handleAction(b.id, "confirmed")}
                  >
                    {actionId === b.id ? "…" : "✓ Conferma"}
                  </button>
                  <button
                    className="dash-action-btn dash-action-btn--reject"
                    disabled={actionId === b.id}
                    onClick={() => handleAction(b.id, "cancelled")}
                  >
                    Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upcoming bookings ───────────────────────── */}
      <div className="dash-card">
        <div className="dash-card__header">
          <div>
            <h2>Prenotazioni in arrivo</h2>
            <p>Prossimi ospiti confermati e in attesa</p>
          </div>
          <Link href="/dashboard/prenotazioni" className="dash-view-all">Vedi tutte →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="dash-empty">
            Nessuna prenotazione futura.{" "}
            <Link href="/dashboard/disponibilita">Aggiorna la disponibilità</Link>.
          </p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Data · Ora</th>
                <th>Ospiti</th>
                <th>Stato</th>
                <th>Rif.</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="dash-table__customer">
                      <span className="dash-avatar-sm">{b.customerName[0].toUpperCase()}</span>
                      <div>
                        <div className="dash-table__name">{b.customerName}</div>
                        <div className="dash-table__email">{b.customerEmail}</div>
                      </div>
                    </div>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Quick actions ───────────────────────────── */}
      <div className="dash-quick-grid">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className="dash-quick-card">
            <span className="dash-quick-card__icon">{a.icon}</span>
            <span className="dash-quick-card__label">{a.label}</span>
            <span className="dash-quick-card__desc">{a.desc}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
