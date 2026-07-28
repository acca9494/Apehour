"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getJobsDone, getJobsUpcoming, type ArtistJob } from "@/lib/artist/store";
import { JobRow } from "@/components/dashboard/artist-job-row";

export default function ApeJobsPagamentiPage() {
  const { user } = useAuth();
  const [jobsDone, setJobsDone] = useState<ArtistJob[]>([]);
  const [jobsUpcoming, setJobsUpcoming] = useState<ArtistJob[]>([]);

  useEffect(() => {
    if (!user) return;
    setJobsDone(getJobsDone(user.id));
    setJobsUpcoming(getJobsUpcoming(user.id));
  }, [user]);

  if (!user) return null;

  const totalDone = jobsDone.reduce((sum, j) => sum + j.compenso, 0);
  const totalUpcoming = jobsUpcoming.reduce((sum, j) => sum + j.compenso, 0);

  return (
    <div className="dash-overview">

      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">Pagamenti</p>
          <h1 className="dash-overview__title">Lavori svolti e in programma</h1>
        </div>
      </div>

      {/* Riepilogo pagamenti */}
      <div className="artist-payment-summary">
        <div className="artist-payment-summary__card">
          <span className="artist-payment-summary__label">Incassato</span>
          <span className="artist-payment-summary__value artist-payment-summary__value--gold">€{totalDone}</span>
        </div>
        <div className="artist-payment-summary__card">
          <span className="artist-payment-summary__label">Da incassare</span>
          <span className="artist-payment-summary__value">€{totalUpcoming}</span>
        </div>
        <div className="artist-payment-summary__card">
          <span className="artist-payment-summary__label">Totale complessivo</span>
          <span className="artist-payment-summary__value">€{totalDone + totalUpcoming}</span>
        </div>
      </div>

      {/* Prossimi lavori */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Prossimi lavori</h2>
          <span className="attivita-badge attivita-badge--green">{jobsUpcoming.length} in programma</span>
        </div>
        <div className="artist-job-list">
          {jobsUpcoming.length === 0
            ? <p className="events-page__empty">Nessun lavoro in programma.</p>
            : jobsUpcoming.map((j) => <JobRow key={j.id} job={j} />)}
        </div>
      </div>

      {/* Lavori completati */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Lavori completati</h2>
          <span className="attivita-badge attivita-badge--muted">{jobsDone.length} completati</span>
        </div>
        <div className="artist-job-list">
          {jobsDone.length === 0
            ? <p className="events-page__empty">Nessun lavoro completato finora.</p>
            : jobsDone.map((j) => <JobRow key={j.id} job={j} />)}
        </div>
      </div>

    </div>
  );
}
