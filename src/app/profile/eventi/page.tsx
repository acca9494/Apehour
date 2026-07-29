"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { getTickets } from "@/lib/tickets/store";
import { downloadTicket } from "@/lib/tickets/download";
import type { EventTicket } from "@/lib/tickets/types";
import { getEventBySlug } from "@/lib/data/events";

const MONTHS: Record<string, number> = {
  gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5,
  lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11,
};

function isPastEvent(dateLabel: string): boolean {
  const match = dateLabel.match(/(\d{1,2})\s+(\w{3})\w*\s*·\s*(\d{1,2}):(\d{2})/i);
  if (!match) return false;
  const [, day, monAbbr, hour, minute] = match;
  const month = MONTHS[monAbbr!.toLowerCase()];
  if (month === undefined) return false;
  const year = new Date().getFullYear();
  const eventDate = new Date(year, month, Number(day), Number(hour), Number(minute));
  return eventDate < new Date();
}

export default function ProfileEventiPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setTickets(getTickets(user.id).filter((t) => t.status !== "cancelled"));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) return null;

  const upcoming = tickets.filter((t) => !isPastEvent(t.eventDate));
  const past = tickets.filter((t) => isPastEvent(t.eventDate));

  return (
    <div className="dashboard-page-header">
      <div className="profile-attivita__head">
        <div>
          <p className="eyebrow">Eventi</p>
          <h1>I miei eventi</h1>
          <p>I biglietti che hai acquistato, in programma e passati.</p>
        </div>
        <Link href="/events" className="attivita-join-btn">
          Scopri eventi
        </Link>
      </div>

      {/* In programma */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>In programma</h2>
          <span className="attivita-badge attivita-badge--green">{upcoming.length} in arrivo</span>
        </div>
        {loading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : upcoming.length === 0 ? (
          <p className="events-page__empty">
            Nessun evento in programma. <Link href="/events">Scoprili qui →</Link>
          </p>
        ) : (
          <div className="attivita-events-grid">
            {upcoming.map((t) => {
              const event = getEventBySlug(t.eventSlug);
              return (
                <div key={t.id} className="attivita-event-card attivita-event-card--active">
                  <Link href={`/events/${t.eventSlug}`}>
                    {event && (
                      <div className="attivita-event-card__top">
                        <span className="attivita-badge">{event.category}</span>
                      </div>
                    )}
                    <h3 className="attivita-event-card__title">{t.eventTitle}</h3>
                    <p className="attivita-event-card__location">📍 {t.restaurantName}</p>
                    <div className="attivita-event-card__footer">
                      <span className="attivita-event-card__date">📅 {t.eventDate}</span>
                      <span className="attivita-event-card__spots">
                        {t.quantity} {t.quantity === 1 ? "biglietto" : "biglietti"}
                        {t.isFree ? " · Free entry" : ` · €${t.totalPrice.toFixed(2)}`}
                      </span>
                    </div>
                  </Link>
                  <button type="button" className="attivita-join-btn" onClick={() => downloadTicket(t)}>
                    Scarica biglietto
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Passati */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Passati</h2>
          <span className="attivita-badge attivita-badge--muted">{past.length} eventi</span>
        </div>
        {loading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : past.length === 0 ? (
          <p className="events-page__empty">Nessun evento passato finora.</p>
        ) : (
          <div className="attivita-table-card">
            <table className="attivita-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Locale</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {past.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="attivita-table__name">{t.eventTitle}</span>
                    </td>
                    <td className="attivita-table__muted">{t.restaurantName}</td>
                    <td className="attivita-table__muted">{t.eventDate}</td>
                    <td>
                      <button type="button" className="mbk-action-btn" onClick={() => downloadTicket(t)}>
                        Scarica PDF
                      </button>
                    </td>
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
