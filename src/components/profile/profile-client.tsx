"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";
import { fetchClientBookings } from "@/lib/bookings/service";
import type { ClientBooking } from "@/lib/bookings/types";

// ── BEES logic ────────────────────────────────────────────────────────────────

export interface BeeLevel {
  name: string;
  badge: string;
  min: number;
  max: number | null;
}

export const BEE_LEVELS: BeeLevel[] = [
  { name: "Ape Operaia",  badge: "🐝", min: 0,   max: 99   },
  { name: "Ape Esperta",  badge: "🍯", min: 100, max: 249  },
  { name: "Ape Regina",   badge: "👑", min: 250, max: 499  },
  { name: "Ape Leggenda", badge: "💎", min: 500, max: null },
];

export function getLevel(bees: number): BeeLevel {
  let result = BEE_LEVELS[0]!;
  for (const l of BEE_LEVELS) {
    if (bees >= l.min) result = l;
  }
  return result;
}

export function getNextLevel(bees: number): BeeLevel | null {
  return BEE_LEVELS.find((l) => l.min > bees) ?? null;
}

export function computeBees(bookings: ClientBooking[]): number {
  const done = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  );
  let total = done.length * 10;
  if (done.length >= 1) total += 25; // welcome bonus
  return total;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isPast(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}`) < new Date();
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending:   "In attesa",
  confirmed: "Confermata",
  cancelled: "Annullata",
  completed: "Completata",
  no_show:   "No-show",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileClient() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!user) return null;

  const firstName = user.name.split(" ")[0];

  const upcoming = bookings.filter(
    (b) => !isPast(b.date, b.time) && b.status !== "cancelled"
  );
  const totalDone = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  ).length;

  return (
    <div className="user-overview">

      {/* Header */}
      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">{todayLabel()}</p>
          <h1 className="dash-overview__title">Bentornato, {firstName}</h1>
        </div>
        <ClayLink href="/search" variant="secondary" className="dash-overview__cta">
          Prenota ora
        </ClayLink>
      </div>

      {/* KPI strip */}
      <div className="dash-kpi-grid">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dash-kpi-card dash-kpi-card--loading" />
          ))
        ) : (
          <>
            <div className="dash-kpi-card">
              <span className="dash-kpi-card__icon">◈</span>
              <span className="dash-kpi-card__label">Prenotazioni totali</span>
              <span className="dash-kpi-card__value">{bookings.length}</span>
              <span className="dash-kpi-card__sub">{totalDone} confermate</span>
            </div>
            <div className={`dash-kpi-card${upcoming.length > 0 ? " dash-kpi-card--urgent" : ""}`}>
              <span className="dash-kpi-card__icon">◷</span>
              <span className="dash-kpi-card__label">In arrivo</span>
              <span className="dash-kpi-card__value">{upcoming.length}</span>
              <span className="dash-kpi-card__sub">
                {upcoming.length > 0 ? "Prossime visite" : "Nessuna in programma"}
              </span>
            </div>
            <div className="dash-kpi-card">
              <span className="dash-kpi-card__icon">⬡</span>
              <span className="dash-kpi-card__label">BEES</span>
              <span className="dash-kpi-card__value dash-kpi-card__value--gold">Coming soon</span>
            </div>
          </>
        )}
      </div>

      {/* Upcoming bookings */}
      <div className="dash-card">
        <div className="dash-card__header">
          <div>
            <h2>Prossime visite</h2>
            <p>Le tue prenotazioni confermate</p>
          </div>
          <Link href="/profile/prenotazioni" className="dash-view-all">Tutte →</Link>
        </div>

        {loading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : upcoming.length === 0 ? (
          <div className="dash-empty">
            <p>Nessuna prenotazione in programma.</p>
            <div style={{ marginTop: "0.75rem" }}>
              <ClayLink href="/search">Scopri i locali</ClayLink>
            </div>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Locale</th>
                <th>Data · Ora</th>
                <th>Ospiti</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.slice(0, 5).map((b) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick actions */}
      <div className="dash-quick-grid">
        <Link href="/search" className="dash-quick-card">
          <span className="dash-quick-card__icon">🍹</span>
          <span className="dash-quick-card__label">Prenota</span>
          <span className="dash-quick-card__desc">Scopri i locali vicino a te</span>
        </Link>
        <Link href="/profile/prenotazioni" className="dash-quick-card">
          <span className="dash-quick-card__icon">≡</span>
          <span className="dash-quick-card__label">Prenotazioni</span>
          <span className="dash-quick-card__desc">Storico e prenotazioni attive</span>
        </Link>
        <Link href="/profile/apejobs" className="dash-quick-card">
          <span className="dash-quick-card__icon">▣</span>
          <span className="dash-quick-card__label">ApeJobs</span>
          <span className="dash-quick-card__desc">Trova il tuo prossimo lavoro</span>
        </Link>
      </div>

    </div>
  );
}
