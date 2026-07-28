"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EVENTS } from "@/lib/data/events";

const CATEGORIES = [
  "Festival", "Musica Live", "DJ Set", "Degustazione", "Speciale", "Cocktail",
  "Aperitivo", "Karaoke", "Quiz Night", "Silent Disco", "Stand-up Comedy", "Vinyl Night", "Workshop",
];
const CITIES = ["Tutte le città", "Milano", "Roma", "Firenze", "Venezia", "Napoli", "Torino", "Bologna"];

function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function toggleCategory(list: string[], cat: string): string[] {
  return list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat];
}

export default function EventsPage() {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeCity, setActiveCity] = useState("Tutte le città");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("apehour_city");
      if (saved && CITIES.includes(saved)) setActiveCity(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (!cityDropdown) return;
    function handler(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cityDropdown]);

  const filtered = EVENTS.filter((e) => {
    const matchesCategory = activeCategories.length === 0 || activeCategories.includes(e.category);
    const matchesCity = activeCity === "Tutte le città" || e.location.split(",")[0]?.trim() === activeCity;
    return matchesCategory && matchesCity;
  });

  const groups: Array<{ category: string; events: typeof filtered }> = [];
  for (const cat of CATEGORIES) {
    const events = filtered.filter((e) => e.category === cat);
    if (events.length > 0) groups.push({ category: cat, events });
  }

  return (
    <div className="events-page">

      {/* City + category filter */}
      <div className="events-page__filters">
        <div className="events-city-wrap" ref={cityRef}>
          <button
            type="button"
            className="events-city-btn"
            onClick={() => setCityDropdown((v) => !v)}
            aria-expanded={cityDropdown}
          >
            <PinIcon className="events-city-btn__icon" aria-hidden="true" />
            <span>{activeCity === "Tutte le città" ? activeCity : `${activeCity}, Italia`}</span>
            <ChevronDownIcon
              className={`events-city-btn__chevron${cityDropdown ? " events-city-btn__chevron--up" : ""}`}
              aria-hidden="true"
            />
          </button>
          {cityDropdown && (
            <ul className="events-city-dropdown" role="listbox">
              {CITIES.map((c) => (
                <li key={c} role="option" aria-selected={c === activeCity}>
                  <button
                    type="button"
                    className={`events-city-dropdown__item${c === activeCity ? " is-active" : ""}`}
                    onClick={() => { setActiveCity(c); setCityDropdown(false); }}
                  >
                    {c !== "Tutte le città" && <PinIcon className="events-city-dropdown__icon" aria-hidden="true" />}
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="events-page__filters-sep" aria-hidden="true" />

        <div className="events-page__categories">
          <button
            type="button"
            className={`events-filter-pill${activeCategories.length === 0 ? " is-active" : ""}`}
            onClick={() => setActiveCategories([])}
          >
            Tutti
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`events-filter-pill${activeCategories.includes(cat) ? " is-active" : ""}`}
              onClick={() => setActiveCategories((prev) => toggleCategory(prev, cat))}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile-only: single "Filtri" trigger, same line as the city selector */}
        <button
          type="button"
          className="mobile-search-btn mobile-search-btn--filtri events-filtri-trigger"
          onClick={() => setFiltersOpen(true)}
        >
          <svg className="mobile-search-btn__icon" viewBox="0 0 22 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polygon points="5.5,0 9.5,0 11.5,3.46 9.5,6.93 5.5,6.93 3.5,3.46" />
            <polygon points="12.5,0 16.5,0 18.5,3.46 16.5,6.93 12.5,6.93 10.5,3.46" />
            <polygon points="5.5,7.07 9.5,7.07 11.5,10.54 9.5,14 5.5,14 3.5,10.54" />
            <polygon points="12.5,7.07 16.5,7.07 18.5,10.54 16.5,14 12.5,14 10.5,10.54" />
          </svg>
          <span className="mobile-search-btn__filtri-label">Filtri</span>
          <span className="mobile-search-btn__filtri-count">
            {filtered.length === 0 ? "nessun evento" : filtered.length === 1 ? "1 evento" : `${filtered.length} eventi`}
          </span>
        </button>
      </div>

      {filtersOpen && (
        <>
          <div className="mobile-filter-backdrop" onClick={() => setFiltersOpen(false)} />
          <div className="mobile-filter-sheet">
            <div className="mobile-filter-sheet__handle" />
            <div className="mobile-filter-sheet__header">
              <h3>Filtri</h3>
              <button type="button" className="mobile-filter-sheet__close" onClick={() => setFiltersOpen(false)} aria-label="Chiudi filtri">✕</button>
            </div>
            <div className="mobile-filter-sheet__body">
              <div className="search-sidebar__group" style={{ flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.5rem" }}>Categoria</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className={`events-filter-pill${activeCategories.length === 0 ? " is-active" : ""}`}
                      onClick={() => setActiveCategories([])}
                    >
                      Tutti
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`events-filter-pill${activeCategories.includes(cat) ? " is-active" : ""}`}
                        onClick={() => setActiveCategories((prev) => toggleCategory(prev, cat))}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mobile-filter-sheet__footer">
              <button type="button" className="mobile-filter-sheet__reset" onClick={() => setActiveCategories([])}>Azzera</button>
              <button type="button" className="mobile-filter-sheet__apply" onClick={() => setFiltersOpen(false)}>
                Mostra {filtered.length} eventi
              </button>
            </div>
          </div>
        </>
      )}

      {/* Grid, grouped by category */}
      <div className="events-page__body">
        {filtered.length === 0 ? (
          <div className="events-page__empty">
            <p>Nessun evento in questa categoria.</p>
          </div>
        ) : (
          groups.map(({ category, events }) => (
            <div key={category} className="events-page__category-group">
              <h2 className="events-page__category-heading">{category}</h2>
              <div className="event-grid events-page__grid">
                {events.map((event) => (
                  <Link key={event.id} className="event-card" href={`/events/${event.slug}`}>
                    <div className="event-card__image">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <span className="event-card__category">{event.category}</span>
                      <span className="event-card__bees">+{event.bees} 🐝</span>
                    </div>
                    <div className="event-card__body">
                      <h3>{event.title}</h3>
                      <p>{event.date} · {event.location}</p>
                      <strong>{event.price}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
