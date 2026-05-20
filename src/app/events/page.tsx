import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eventi — ApeHour",
  description: "Aperitivi speciali, music festival, serate esclusive. Partecipa e guadagna BEES.",
};

const EVENTS = [
  {
    id: "ev1",
    title: "Ape in Vigna — Harvest Festival",
    date: "Sab 24 Mag · 16:00",
    location: "Franciacorta, Brescia",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
    category: "Festival",
    price: "da €28",
    bees: 50,
    slug: "harvest-festival",
  },
  {
    id: "ev2",
    title: "Sunset Jazz & Spritz",
    date: "Dom 25 Mag · 18:00",
    location: "Milano, Navigli",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    category: "Musica Live",
    price: "da €20",
    bees: 35,
    slug: "sunset-jazz-spritz",
  },
  {
    id: "ev3",
    title: "Rooftop Music Festival",
    date: "Ven 30 Mag · 19:00",
    location: "Roma, Prati",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    category: "DJ Set",
    price: "da €35",
    bees: 60,
    slug: "rooftop-music-festival",
  },
  {
    id: "ev4",
    title: "Negroni Week Speciale",
    date: "Gio 5 Giu · 19:30",
    location: "Firenze, Oltrarno",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    category: "Degustazione",
    price: "da €22",
    bees: 40,
    slug: "negroni-week",
  },
  {
    id: "ev5",
    title: "Aperitivo sotto le Stelle",
    date: "Sab 7 Giu · 20:00",
    location: "Torino, Colline",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
    category: "Speciale",
    price: "da €18",
    bees: 30,
    slug: "aperitivo-stelle",
  },
  {
    id: "ev6",
    title: "Bollicine & Beats",
    date: "Dom 8 Giu · 17:30",
    location: "Venezia, Giudecca",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80",
    category: "DJ Set",
    price: "da €30",
    bees: 45,
    slug: "bollicine-beats",
  },
  {
    id: "ev7",
    title: "Ape Circus Night",
    date: "Ven 13 Giu · 21:00",
    location: "Bologna, Centro",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    category: "Speciale",
    price: "da €25",
    bees: 55,
    slug: "ape-circus-night",
  },
  {
    id: "ev8",
    title: "Natural Wine Festival",
    date: "Sab 14 Giu · 15:00",
    location: "Napoli, Chiaia",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    category: "Festival",
    price: "da €32",
    bees: 65,
    slug: "natural-wine-festival",
  },
];

const CATEGORIES = ["Tutti", "Festival", "Musica Live", "DJ Set", "Degustazione", "Speciale"];

export default function EventsPage() {
  return (
    <div className="events-page">

      {/* Category filter */}
      <div className="events-page__filters">
        {CATEGORIES.map((cat) => (
          <span key={cat} className={`events-filter-pill${cat === "Tutti" ? " is-active" : ""}`}>
            {cat}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="events-page__body">
        <div className="event-grid events-page__grid">
          {EVENTS.map((event) => (
            <Link key={event.id} className="event-card" href={`/search?event=${event.slug}`}>
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

    </div>
  );
}
