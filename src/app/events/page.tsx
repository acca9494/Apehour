"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EVENTS } from "@/lib/data/events";

const CATEGORIES = ["Tutti", "Festival", "Musica Live", "DJ Set", "Degustazione", "Speciale", "Cocktail"];
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

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("Tutti");
  const [activeCity, setActiveCity] = useState("Tutte le città");
  const [cityDropdown, setCityDropdown] = useState(false);
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
    const matchesCategory = activeCategory === "Tutti" || e.category === activeCategory;
    const matchesCity = activeCity === "Tutte le città" || e.location.split(",")[0]?.trim() === activeCity;
    return matchesCategory && matchesCity;
  });

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
            <span>{activeCity}</span>
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

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`events-filter-pill${cat === activeCategory ? " is-active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="events-page__body">
        {filtered.length === 0 ? (
          <div className="events-page__empty">
            <p>Nessun evento in questa categoria.</p>
          </div>
        ) : (
          <div className="event-grid events-page__grid">
            {filtered.map((event) => (
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
        )}
      </div>

    </div>
  );
}
