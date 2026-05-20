"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { fetchClientBookings } from "@/lib/bookings/service";
import type { ClientBooking } from "@/lib/bookings/types";
import {
  computeBees,
  getLevel,
  getNextLevel,
  BEE_LEVELS,
} from "@/components/profile/profile-client";

// ── How to earn ───────────────────────────────────────────────────────────────

const EARN_WAYS = [
  {
    icon: "🍹",
    label: "Prima prenotazione",
    desc: "Bonus di benvenuto, solo la prima volta",
    amount: 25,
    badge: "Fatto una volta",
  },
  {
    icon: "🐝",
    label: "Ogni prenotazione confermata",
    desc: "Guadagni BEES ad ogni visita",
    amount: 10,
    badge: "Per ogni visita",
  },
  {
    icon: "⭐",
    label: "Lascia una recensione",
    desc: "Condividi la tua esperienza",
    amount: 8,
    badge: "In arrivo",
  },
  {
    icon: "👫",
    label: "Invita un amico",
    desc: "Quando il tuo amico effettua la prima prenotazione",
    amount: 30,
    badge: "In arrivo",
  },
  {
    icon: "📅",
    label: "Prenota un evento speciale",
    desc: "Live music, DJ set, degustazioni e più",
    amount: 20,
    badge: "In arrivo",
  },
  {
    icon: "🎂",
    label: "Compleanno",
    desc: "Bonus nel mese del tuo compleanno",
    amount: 50,
    badge: "In arrivo",
  },
];

// ── History builder ───────────────────────────────────────────────────────────

interface BeesHistoryItem {
  id: string;
  date: string;
  label: string;
  amount: number;
  icon: string;
}

function buildHistory(bookings: ClientBooking[]): BeesHistoryItem[] {
  const done = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .sort((a, b) => a.date.localeCompare(b.date));

  const items: BeesHistoryItem[] = [];

  if (done.length > 0) {
    items.push({
      id: "welcome",
      date: done[0]!.date,
      label: "Bonus prima prenotazione!",
      amount: 25,
      icon: "⭐",
    });
  }

  for (const b of done) {
    items.push({
      id: b.id,
      date: b.date,
      label: `Prenotazione confermata · ${b.restaurantName}`,
      amount: 10,
      icon: "🐝",
    });
  }

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BeesDashboard() {
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

  const bees = computeBees(bookings);
  const level = getLevel(bees);
  const nextLevel = getNextLevel(bees);
  const progress = nextLevel
    ? ((bees - level.min) / (nextLevel.min - level.min)) * 100
    : 100;
  const history = buildHistory(bookings);

  return (
    <div className="bees-page">

      <div className="dashboard-page-header">
        <p className="eyebrow">BEES</p>
        <h1>Il tuo portafoglio BEES</h1>
        <p>Guadagna punti ad ogni prenotazione e scala i livelli.</p>
      </div>

      {/* Hero score */}
      <div className="bees-score-card">
        <div className="bees-score-card__main">
          <span className="bees-score-card__badge">{level.badge}</span>
          <div>
            <p className="bees-score-card__level">{level.name}</p>
            <p className="bees-score-card__num">
              {bees} <span>BEES</span>
            </p>
          </div>
        </div>
        {nextLevel ? (
          <div className="bees-score-card__progress">
            <div className="bees-score-card__progress-labels">
              <span>{level.name}</span>
              <span>{nextLevel.name} · {nextLevel.min} BEES</span>
            </div>
            <div className="bees-score-card__bar-track">
              <div
                className="bees-score-card__bar-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="bees-score-card__progress-note">
              Ancora <strong>{nextLevel.min - bees} BEES</strong> per diventare {nextLevel.badge} {nextLevel.name}
            </p>
          </div>
        ) : (
          <p className="bees-score-card__progress-note">
            Hai raggiunto il livello massimo! 🎉
          </p>
        )}
      </div>

      {/* Level ladder */}
      <div className="dash-table-card">
        <div style={{ padding: "1rem 1.5rem 0.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.2rem" }}>Livelli BEES</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", margin: 0 }}>Scala i livelli e sblocca vantaggi esclusivi</p>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Livello</th>
              <th>BEES richiesti</th>
              <th>Vantaggi</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {BEE_LEVELS.map((l) => {
              const isActive = l.name === level.name;
              const isDone = bees >= l.min;
              return (
                <tr key={l.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>{l.badge}</span>
                      <strong style={{ color: isActive ? "var(--gold-dk)" : undefined }}>
                        {l.name}
                      </strong>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-3)" }}>
                    {l.min === 0 ? "Da subito" : `${l.min}+`}
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
                    {l.name === "Ape Operaia"  && "Accesso base, BEES su ogni prenotazione"}
                    {l.name === "Ape Esperta"  && "Priorità nelle prenotazioni nei weekend"}
                    {l.name === "Ape Regina"   && "Sconti esclusivi + accesso eventi premium"}
                    {l.name === "Ape Leggenda" && "Tavolo riservato + vantaggi VIP illimitati"}
                  </td>
                  <td>
                    {isActive ? (
                      <span className="bees-level-badge bees-level-badge--active">Attuale</span>
                    ) : isDone ? (
                      <span className="bees-level-badge bees-level-badge--done">✓ Raggiunto</span>
                    ) : (
                      <span className="bees-level-badge bees-level-badge--locked">🔒 Bloccato</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* How to earn */}
      <div className="dash-card">
        <div className="dash-card__header">
          <div>
            <h2>Come guadagnare BEES</h2>
            <p>Più interagisci, più BEES guadagni</p>
          </div>
          <Link href="/search" className="dash-view-all">Prenota ora →</Link>
        </div>
        <div className="bees-earn-grid">
          {EARN_WAYS.map((w) => (
            <div key={w.label} className="bees-earn-card">
              <span className="bees-earn-card__icon">{w.icon}</span>
              <div className="bees-earn-card__body">
                <strong>{w.label}</strong>
                <p>{w.desc}</p>
              </div>
              <div className="bees-earn-card__right">
                <span className="bees-earn-card__amount">+{w.amount}</span>
                <span className="bees-earn-card__unit">BEES</span>
                <span className="bees-earn-card__badge">{w.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="dash-table-card">
        <div style={{ padding: "1rem 1.5rem 0.5rem", borderBottom: "1.5px solid var(--border)" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.2rem" }}>Storico transazioni</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", margin: 0 }}>I tuoi BEES guadagnati nel tempo</p>
        </div>
        {loading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : history.length === 0 ? (
          <div className="dash-empty">
            <p>Nessun BEES ancora. Prenota il tuo primo aperitivo!</p>
            <Link href="/search" className="dash-view-all" style={{ marginTop: "0.5rem", display: "block" }}>
              Scopri i locali →
            </Link>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Motivo</th>
                <th style={{ textAlign: "right" }}>BEES</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="dash-table__ref">{formatDate(item.date)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                      <span style={{ color: "var(--text-2)", fontSize: "0.84rem" }}>{item.label}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="bees-tx-amount">+{item.amount}</span>
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
