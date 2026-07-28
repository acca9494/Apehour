"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { getSignups, leaveActivity, getCompletedActivities, type CompletedActivity } from "@/lib/attivita/store";
import { ACTIVE_ACTIVITIES, type ActiveActivity } from "@/lib/data/activities";
import { ActivitiesBrowser } from "@/components/attivita/activities-browser";

export default function ProfileAttivitaPage() {
  const { user } = useAuth();
  const [todo, setTodo] = useState<ActiveActivity[]>([]);
  const [completed, setCompleted] = useState<CompletedActivity[]>([]);
  const [view, setView] = useState<"mie" | "cerca">("mie");

  useEffect(() => {
    if (!user || view !== "mie") return;
    const joinedIds = getSignups(user.id);
    setTodo(ACTIVE_ACTIVITIES.filter((a) => joinedIds.includes(a.id)));
    setCompleted(getCompletedActivities(user.id));
  }, [user, view]);

  if (!user) return null;

  const totalBeesEarned = completed.reduce((sum, a) => sum + a.bees, 0);

  function handleLeave(activityId: string) {
    if (!user) return;
    leaveActivity(user.id, activityId);
    setTodo((prev) => prev.filter((a) => a.id !== activityId));
  }

  if (view === "cerca") {
    return (
      <div>
        <button type="button" className="artist-back-link" onClick={() => setView("mie")}>
          ← Le mie attività
        </button>
        <ActivitiesBrowser />
      </div>
    );
  }

  return (
    <div className="dashboard-page-header">
      <div className="profile-attivita__head">
        <div>
          <p className="eyebrow">Attività</p>
          <h1>Le mie attività</h1>
          <p>Le attività a cui sei iscritto e lo storico di quelle completate.</p>
        </div>
        <button type="button" className="attivita-join-btn" onClick={() => setView("cerca")}>
          Cerca attività
        </button>
      </div>

      {/* Da fare */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Da fare</h2>
          <span className="attivita-badge attivita-badge--green">{todo.length} in programma</span>
        </div>
        {todo.length === 0 ? (
          <p className="events-page__empty">
            Non sei iscritto a nessuna attività. <Link href="/attivita">Scoprile qui →</Link>
          </p>
        ) : (
          <div className="attivita-events-grid">
            {todo.map((a) => (
              <div key={a.id} className="attivita-event-card attivita-event-card--active">
                <div className="attivita-event-card__top">
                  <span className="attivita-event-card__icon">{a.icon}</span>
                  <span className="attivita-badge">{a.category}</span>
                </div>
                <h3 className="attivita-event-card__title">{a.title}</h3>
                <p className="attivita-event-card__location">📍 {a.location}</p>
                <div className="attivita-event-card__footer">
                  <span className="attivita-event-card__date">📅 {a.date}</span>
                  <span className="attivita-event-card__spots">+{a.bees} 🐝</span>
                </div>
                <button
                  type="button"
                  className="attivita-join-btn is-joined"
                  onClick={() => handleLeave(a.id)}
                >
                  Iscritto ✓ · Annulla
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storico */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Storico</h2>
          <span className="attivita-badge attivita-badge--muted">+{totalBeesEarned} 🐝 guadagnati</span>
        </div>
        {completed.length === 0 ? (
          <p className="events-page__empty">Nessuna attività completata finora.</p>
        ) : (
          <div className="attivita-table-card">
            <table className="attivita-table">
              <thead>
                <tr>
                  <th>Attività</th>
                  <th>Luogo</th>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>BEES guadagnati</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="attivita-table__name">
                        {a.icon} {a.title}
                      </span>
                    </td>
                    <td className="attivita-table__muted">{a.location}</td>
                    <td className="attivita-table__muted">{a.date}</td>
                    <td><span className="attivita-badge attivita-badge--muted">{a.category}</span></td>
                    <td><span className="attivita-table__donated">+{a.bees} 🐝</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
