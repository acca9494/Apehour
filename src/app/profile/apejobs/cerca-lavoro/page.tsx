"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { getArtistProfile } from "@/lib/artist/store";
import { getAllAreaJobs, type PostedAreaJob } from "@/lib/jobs/area-jobs-store";
import { applyToJob, getApplicationsForArtist, withdrawApplication } from "@/lib/artist/applications";
import { getMyArtistListing, upsertArtistListing, removeArtistListing } from "@/lib/jobs/artist-listings-store";
import { slugify } from "@/lib/utils";

const CITIES = ["Tutte", "Milano", "Roma", "Firenze", "Torino", "Napoli", "Bologna", "Venezia"];

export default function CercaLavoroPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PostedAreaJob[]>([]);
  const [cityFilter, setCityFilter] = useState("Tutte");
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [discipline, setDiscipline] = useState("");
  const [listed, setListed] = useState(false);

  useEffect(() => {
    if (!user) return;
    setJobs(getAllAreaJobs());
    setAppliedIds(getApplicationsForArtist(user.id).map((a) => a.jobId));
    const profile = getArtistProfile(user.id);
    setDiscipline(profile.discipline);
    setCityFilter(profile.city);
    setListed(!!getMyArtistListing(user.id));
  }, [user]);

  if (!user) return null;

  const filtered = jobs.filter((j) => cityFilter === "Tutte" || j.city === cityFilter);

  function handleApply(jobId: string) {
    if (!user) return;
    applyToJob({
      jobId,
      artistUserId: user.id,
      artistName: user.name,
      discipline,
      city: cityFilter,
      appliedAt: new Date().toISOString(),
    });
    setAppliedIds((prev) => [...prev, jobId]);
  }

  function handleWithdraw(jobId: string) {
    if (!user) return;
    withdrawApplication(jobId, user.id);
    setAppliedIds((prev) => prev.filter((id) => id !== jobId));
  }

  function toggleListing() {
    if (!user) return;
    if (listed) {
      removeArtistListing(user.id);
      setListed(false);
    } else {
      const profile = getArtistProfile(user.id);
      const fullName = `${profile.firstName} ${profile.lastName}`.trim() || user.name;
      upsertArtistListing({
        id: `me-${user.id}`,
        userId: user.id,
        name: fullName,
        discipline: profile.discipline,
        city: profile.city,
        rate: profile.rate,
        rating: 5,
        likes: 0,
        avatar: "🎤",
        bio: profile.bio || "Disponibile per serate ed eventi.",
      });
      setListed(true);
    }
  }

  return (
    <div className="dash-overview">

      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">Cerca lavoro</p>
          <h1 className="dash-overview__title">Locali che cercano artisti</h1>
        </div>
        <button type="button" className={`attivita-join-btn${listed ? " is-joined" : ""}`} onClick={toggleListing}>
          {listed ? "Annuncio pubblicato ✓ · Rimuovi" : "Crea il tuo annuncio"}
        </button>
      </div>

      <div className="artist-city-filter">
        <span className="artist-city-filter__label">📍 Città</span>
        <select
          className="artist-city-filter__select"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        >
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="attivita-events-grid">
        {filtered.length === 0 ? (
          <p className="events-page__empty">Nessun annuncio {cityFilter !== "Tutte" ? `a ${cityFilter}` : ""} al momento.</p>
        ) : filtered.map((job) => {
          const applied = appliedIds.includes(job.id);
          return (
            <div key={job.id} className="attivita-event-card attivita-event-card--active">
              <Link href={`/restaurants/${slugify(job.venueName)}`} className="attivita-event-card__link">
                <div className="attivita-event-card__top">
                  <span className="attivita-badge">{job.category}</span>
                </div>
                <h3 className="attivita-event-card__title">{job.title}</h3>
                <p className="attivita-event-card__location">📍 {job.venueName} · {job.city}</p>
                <div className="attivita-event-card__footer">
                  <span className="attivita-event-card__date">📅 {job.date}</span>
                  <span className="attivita-event-card__spots">€{job.compenso}</span>
                </div>
              </Link>
              <button
                type="button"
                className={`attivita-join-btn${applied ? " is-joined" : ""}`}
                onClick={() => applied ? handleWithdraw(job.id) : handleApply(job.id)}
              >
                {applied ? "Candidato ✓ · Annulla" : "Candidati"}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
