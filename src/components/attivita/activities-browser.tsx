"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { addBees } from "@/lib/bees/store";
import { getSignups, joinActivity, leaveActivity } from "@/lib/attivita/store";
import { ACTIVE_ACTIVITIES, ACTIVITY_KPI } from "@/lib/data/activities";

const PAST_EVENTS = [
  {
    title: "Pulizia Spiaggia Positano",
    location: "Napoli · Positano",
    date: "10 Apr 2026",
    category: "Spiagge",
    attendees: 64,
    kg: "180 kg",
    icon: "🏖️",
  },
  {
    title: "Pulizia Villa Borghese",
    location: "Roma · Borghese",
    date: "3 Apr 2026",
    category: "Parchi",
    attendees: 41,
    kg: "95 kg",
    icon: "🌳",
  },
  {
    title: "Pulizia Riva Po",
    location: "Torino · Murazzi",
    date: "22 Mar 2026",
    category: "Fiumi",
    attendees: 88,
    kg: "240 kg",
    icon: "🌊",
  },
  {
    title: "Plogging Pigneto",
    location: "Roma · Pigneto",
    date: "15 Mar 2026",
    category: "Sport & Natura",
    attendees: 55,
    kg: "130 kg",
    icon: "🏃",
  },
];

export function ActivitiesBrowser() {
  const { user } = useAuth();
  const router = useRouter();
  const [joined, setJoined] = useState<string[]>([]);

  useEffect(() => {
    if (user) setJoined(getSignups(user.id));
  }, [user]);

  function toggleJoin(activityId: string, beesReward: number) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (joined.includes(activityId)) {
      setJoined(leaveActivity(user.id, activityId));
    } else {
      setJoined(joinActivity(user.id, activityId));
      addBees(user.id, beesReward);
    }
  }

  return (
    <div className="attivita-dash">

      {/* Header */}
      <div className="attivita-dash__header">
        <div>
          <p className="eyebrow">Attività</p>
          <h1>Partecipa e guadagna BEES</h1>
          <p className="attivita-dash__sub">
            Pulisci una spiaggia, un parco, un fiume — poi meritati l&apos;aperitivo.
            Ogni attività ti porta BEES: i punti con cui sblocchi sconti e posti esclusivi.
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="attivita-kpi-grid">
        {ACTIVITY_KPI.map((k) => (
          <div key={k.label} className="attivita-kpi-card">
            <span className="attivita-kpi-card__icon">{k.icon}</span>
            <span className="attivita-kpi-card__label">{k.label}</span>
            <span className="attivita-kpi-card__value">{k.value}</span>
            <span className="attivita-kpi-card__trend">{k.trend}</span>
          </div>
        ))}
      </div>

      {/* Active events */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Attività in programma</h2>
          <span className="attivita-badge attivita-badge--green">{ACTIVE_ACTIVITIES.length} disponibili</span>
        </div>
        <div className="attivita-events-grid">
          {ACTIVE_ACTIVITIES.map((e) => {
            const isJoined = joined.includes(e.id);
            return (
              <div key={e.id} className="attivita-event-card attivita-event-card--active">
                <div className="attivita-event-card__top">
                  <span className="attivita-event-card__icon">{e.icon}</span>
                  <span className="attivita-badge">{e.category}</span>
                </div>
                <h3 className="attivita-event-card__title">{e.title}</h3>
                <p className="attivita-event-card__location">📍 {e.location}</p>
                <div className="attivita-event-card__footer">
                  <span className="attivita-event-card__date">📅 {e.date}</span>
                  <span className="attivita-event-card__spots">+{e.bees} 🐝 · {e.spots} posti</span>
                </div>
                <button
                  type="button"
                  className={`attivita-join-btn${isJoined ? " is-joined" : ""}`}
                  onClick={() => toggleJoin(e.id, e.bees)}
                >
                  {isJoined ? "Iscritto ✓" : "Iscriviti"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past events */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Attività completate</h2>
          <span className="attivita-badge attivita-badge--muted">{PAST_EVENTS.length} completate</span>
        </div>
        <div className="attivita-table-card">
          <table className="attivita-table">
            <thead>
              <tr>
                <th>Attività</th>
                <th>Luogo</th>
                <th>Data</th>
                <th>Categoria</th>
                <th>Partecipanti</th>
                <th>Rifiuti raccolti</th>
              </tr>
            </thead>
            <tbody>
              {PAST_EVENTS.map((e) => (
                <tr key={e.title}>
                  <td>
                    <span className="attivita-table__name">
                      {e.icon} {e.title}
                    </span>
                  </td>
                  <td className="attivita-table__muted">{e.location}</td>
                  <td className="attivita-table__muted">{e.date}</td>
                  <td><span className="attivita-badge attivita-badge--muted">{e.category}</span></td>
                  <td className="attivita-table__center">{e.attendees}</td>
                  <td><span className="attivita-table__donated">{e.kg}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
