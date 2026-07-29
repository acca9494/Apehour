"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getVenueSettings } from "@/lib/merchant/store";
import { getApplications, type JobApplication } from "@/lib/artist/applications";
import { getAllAreaJobs, postAreaJob, type PostedAreaJob } from "@/lib/jobs/area-jobs-store";
import { getAllAvailableArtists } from "@/lib/jobs/artist-listings-store";

const CITIES = ["Tutte", "Roma", "Ostia", "Fregene", "Ladispoli"];
const CATEGORIES = ["DJ set", "Musicista live", "Performer", "Bartender flair"];

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

function downloadCV(app: JobApplication) {
  const content = `CV — ${app.artistName}\nDisciplina: ${app.discipline}\nCittà: ${app.city}\nCandidato il: ${new Date(app.appliedAt).toLocaleDateString("it-IT")}\n\nCV di esempio generato da ApeJobs.`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CV_${app.artistName.replace(/\s+/g, "_")}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function OfferteLavoroPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [areaJobs, setAreaJobs] = useState<PostedAreaJob[]>([]);
  const [cityFilter, setCityFilter] = useState("Tutte");
  const [venueName, setVenueName] = useState<string | null>(null);
  const [venueCity, setVenueCity] = useState<string | null>(null);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [compenso, setCompenso] = useState("");

  useEffect(() => {
    setApplications(getApplications());
    setAreaJobs(getAllAreaJobs());
    if (user) {
      const settings = getVenueSettings(user.id);
      setVenueName(settings.name);
      setVenueCity(settings.city);
    }
  }, [user]);

  const myEvents = areaJobs.filter((j) => j.venueName === venueName || j.postedBy === user?.id);
  const availableArtists = getAllAvailableArtists();
  const filteredArtists = availableArtists.filter(
    (a) => cityFilter === "Tutte" || a.city === cityFilter
  );

  function candidatesFor(event: PostedAreaJob): JobApplication[] {
    return applications.filter((a) => a.jobId === event.id);
  }

  const openEvent = myEvents.find((e) => e.id === openEventId) ?? null;

  function handlePostJob(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !venueName || !venueCity) return;
    postAreaJob({
      title,
      venueName,
      city: venueCity,
      category: category || CATEGORIES[0]!,
      date,
      compenso: Number(compenso) || 0,
      postedBy: user.id,
    });
    setAreaJobs(getAllAreaJobs());
    setTitle(""); setCategory(""); setDate(""); setCompenso("");
    setShowPostForm(false);
  }

  return (
    <div className="dash-overview">

      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">Le mie offerte di lavoro</p>
          <h1 className="dash-overview__title">Annunci e candidature</h1>
        </div>
        <button type="button" className="clay-button clay-button--secondary dash-overview__cta" onClick={() => setShowPostForm((v) => !v)}>
          Pubblica un&apos;offerta di lavoro
        </button>
      </div>

      {showPostForm && (
        <form className="auth-form" style={{ maxWidth: 480 }} onSubmit={handlePostJob}>
          <label>
            Titolo annuncio
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cercasi DJ per sabato sera" required />
          </label>
          <label>
            Categoria
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="" disabled>Seleziona…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Data
            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="es. 12 Lug 2026" required />
          </label>
          <label>
            Compenso (€)
            <input type="number" value={compenso} onChange={(e) => setCompenso(e.target.value)} placeholder="150" required min={0} />
          </label>
          <button type="submit" className="mreg__btn mreg__btn--primary">Pubblica annuncio</button>
        </form>
      )}

      {/* Le mie offerte */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Le mie offerte</h2>
          <span className="attivita-badge attivita-badge--green">{myEvents.length} in programma</span>
        </div>
        {myEvents.length === 0 ? (
          <p className="events-page__empty">Nessun annuncio pubblicato per {venueName ?? "il tuo locale"}.</p>
        ) : (
          <div className="artist-job-list">
            {myEvents.map((event) => {
              const candidates = candidatesFor(event);
              return (
                <div key={event.id} className="artist-job-row" style={{ cursor: "default" }}>
                  <div className="artist-job-row__main">
                    <strong>{event.title}</strong>
                    <span>{event.category} · {event.city}</span>
                  </div>
                  <div className="artist-job-row__meta">
                    <span className="artist-job-row__date">📅 {event.date}</span>
                    <span className="artist-job-row__compenso">€{event.compenso}</span>
                    <button
                      type="button"
                      className="attivita-join-btn"
                      onClick={() => setOpenEventId(event.id)}
                    >
                      {candidates.length} candidat{candidates.length === 1 ? "o" : "i"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Specchietto candidati (modal) */}
      {openEvent && (
        <div className="artist-modal-backdrop" onClick={() => setOpenEventId(null)}>
          <div className="artist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="artist-modal__head">
              <div>
                <p className="dash-overview__date">Candidati</p>
                <h2 style={{ margin: 0 }}>{openEvent.title}</h2>
              </div>
              <button type="button" className="artist-back-link" onClick={() => setOpenEventId(null)}>
                ✕ Chiudi
              </button>
            </div>
            {candidatesFor(openEvent).length === 0 ? (
              <p className="events-page__empty">Nessuna candidatura ricevuta per questo annuncio.</p>
            ) : (
              <div className="artist-job-list">
                {candidatesFor(openEvent).map((a) => (
                  <div key={`${a.jobId}-${a.artistUserId}`} className="artist-job-row" style={{ cursor: "default" }}>
                    <div className="artist-job-row__main">
                      <strong>{a.artistName}</strong>
                      <span>{a.discipline} · {a.city} — candidato il {new Date(a.appliedAt).toLocaleDateString("it-IT")}</span>
                    </div>
                    <div className="artist-job-row__meta">
                      <button type="button" className="attivita-join-btn" onClick={() => downloadCV(a)}>
                        Scarica CV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Artisti disponibili */}
      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Artisti disponibili{venueCity ? ` vicino a ${venueCity}` : ""}</h2>
          <select
            className="artist-city-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="attivita-events-grid">
          {filteredArtists.map((a) => (
            <div key={a.id} className="attivita-event-card">
              <div className="attivita-event-card__top">
                <span className="attivita-event-card__icon">{a.avatar}</span>
                <span className="attivita-badge">{a.discipline}</span>
              </div>
              <h3 className="attivita-event-card__title">{a.name}</h3>
              <p className="attivita-event-card__location">📍 {a.city}{a.rate ? ` · ${a.rate}` : ""}</p>
              <p className="attivita-event-card__location">{a.bio}</p>
              <div className="attivita-event-card__footer">
                <StarRating value={a.rating} />
                <span className="attivita-event-card__spots">❤ {a.likes}</span>
              </div>
              <a className="attivita-join-btn" href={`mailto:?subject=${encodeURIComponent(`Collaborazione con ${a.name}`)}`}>
                Contatta
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
