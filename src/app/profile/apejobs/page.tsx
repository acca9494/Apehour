"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import {
  getJobsDone,
  getJobsUpcoming,
  getLikes,
  getRatings,
  averageRating,
  type ArtistJob,
} from "@/lib/artist/store";
import { JobRow } from "@/components/dashboard/artist-job-row";

function todayLabel() {
  return new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="artist-stars" aria-label={`${value.toFixed(1)} su 5 stelle`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? "artist-stars__star is-filled" : "artist-stars__star"}>★</span>
      ))}
    </span>
  );
}

export default function ApeJobsOverviewPage() {
  const { user } = useAuth();
  const [jobsDone, setJobsDone] = useState<ArtistJob[]>([]);
  const [jobsUpcoming, setJobsUpcoming] = useState<ArtistJob[]>([]);
  const [likes, setLikes] = useState(0);
  const [rating, setRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setJobsDone(getJobsDone(user.id));
    setJobsUpcoming(getJobsUpcoming(user.id));
    setLikes(getLikes(user.id));
    const ratings = getRatings(user.id);
    setRating(averageRating(ratings));
    setRatingCount(ratings.length);
  }, [user]);

  if (!user) return null;

  const totalCompenso = jobsDone.reduce((sum, j) => sum + j.compenso, 0);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="dash-overview">

      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">{todayLabel()}</p>
          <h1 className="dash-overview__title">Bentornato, {firstName}</h1>
        </div>
        <Link href="/profile/apejobs/cerca-lavoro" className="clay-button clay-button--secondary dash-overview__cta">
          Cerca un lavoro
        </Link>
      </div>

      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <span className="dash-kpi-card__icon">✓</span>
          <span className="dash-kpi-card__label">Lavori completati</span>
          <span className="dash-kpi-card__value">{jobsDone.length}</span>
          <span className="dash-kpi-card__sub">€{totalCompenso} guadagnati</span>
        </div>
        <div className="dash-kpi-card">
          <span className="dash-kpi-card__icon">◷</span>
          <span className="dash-kpi-card__label">In programma</span>
          <span className="dash-kpi-card__value">{jobsUpcoming.length}</span>
          <span className="dash-kpi-card__sub">prossimi lavori</span>
        </div>
        <div className="dash-kpi-card">
          <span className="dash-kpi-card__icon">❤</span>
          <span className="dash-kpi-card__label">Likes ricevuti</span>
          <span className="dash-kpi-card__value">{likes}</span>
          <span className="dash-kpi-card__sub">dai locali e dai clienti</span>
        </div>
        <div className="dash-kpi-card">
          <span className="dash-kpi-card__icon">★</span>
          <span className="dash-kpi-card__label">Rating medio</span>
          <span className="dash-kpi-card__value dash-kpi-card__value--gold">{rating.toFixed(1)}</span>
          <span className="dash-kpi-card__sub"><StarRating value={rating} /> · {ratingCount} recensioni</span>
        </div>
      </div>

      {/* Specchietto: prossimi lavori + recenti */}
      <div className="artist-preview-grid">
        <div className="artist-preview-card">
          <div className="artist-preview-card__head">
            <h3>Prossimi lavori</h3>
            <Link href="/profile/apejobs/pagamenti">Vedi tutti →</Link>
          </div>
          {jobsUpcoming.length === 0 ? (
            <p className="events-page__empty">Nessun lavoro in programma.</p>
          ) : (
            <div className="artist-job-list">
              {jobsUpcoming.slice(0, 2).map((j) => <JobRow key={j.id} job={j} />)}
            </div>
          )}
        </div>
        <div className="artist-preview-card">
          <div className="artist-preview-card__head">
            <h3>Recenti</h3>
            <Link href="/profile/apejobs/pagamenti">Vedi tutti →</Link>
          </div>
          {jobsDone.length === 0 ? (
            <p className="events-page__empty">Nessun lavoro completato finora.</p>
          ) : (
            <div className="artist-job-list">
              {jobsDone.slice(0, 2).map((j) => <JobRow key={j.id} job={j} />)}
            </div>
          )}
        </div>
      </div>

      {/* Lavori più recenti */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Lavori più recenti</h2>
          <Link href="/profile/apejobs/pagamenti" className="attivita-badge attivita-badge--muted">
            Vedi tutti →
          </Link>
        </div>
        <div className="artist-job-list">
          {jobsDone.length === 0
            ? <p className="events-page__empty">Nessun lavoro completato finora.</p>
            : jobsDone.slice(0, 5).map((j) => <JobRow key={j.id} job={j} />)}
        </div>
      </div>

    </div>
  );
}
