"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEventBySlug, type EventItem } from "@/lib/data/events";
import { getMerchantEventBySlug } from "@/lib/events/merchant-events-store";
import { restaurants } from "@/lib/data/restaurants";
import { TicketPurchaseForm } from "@/components/booking/ticket-purchase-form";

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = params.slug;
    const staticEvent = getEventBySlug(slug);
    setEvent(staticEvent ?? getMerchantEventBySlug(slug));
    setLoading(false);
  }, [params.slug]);

  if (loading) return null;

  if (!event) {
    return (
      <div className="event-detail">
        <div className="event-detail__body" style={{ paddingTop: "3rem" }}>
          <div className="dash-empty">
            <p>Evento non trovato.</p>
            <div style={{ marginTop: "0.75rem" }}>
              <Link href="/events" className="clay-button clay-button--primary">← Tutti gli eventi</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const restaurant = restaurants.find((r) => r.slug === event.restaurantSlug);

  return (
    <div className="event-detail">

      {/* ── Hero ── */}
      <div className="event-detail__hero">
        <Link href="/events" className="detail-back-btn" aria-label="Torna agli eventi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority
          sizes="100vw"
          className="event-detail__hero-img"
        />
        <div className="event-detail__hero-overlay" />
        <div className="event-detail__hero-content">
          <span className="event-detail__category">{event.category}</span>
          <h1 className="event-detail__title">{event.title}</h1>
          <p className="event-detail__meta">{event.date} · {event.location}</p>
          <div className="event-detail__badges">
            <span className="event-detail__price">{event.price}</span>
            <span className="event-detail__bees">+{event.bees} 🐝 BEES</span>
          </div>
        </div>
      </div>

      <div className="event-detail__body">

        {/* ── Description ── */}
        <section className="event-detail__section">
          <h2>L&apos;evento</h2>
          <p className="event-detail__desc">{event.description}</p>
        </section>

        {/* ── Details ── */}
        <section className="event-detail__section">
          <h2>Dettagli</h2>
          <div className="event-detail__info-grid">
            <div className="event-detail__info-item">
              <span className="event-detail__info-label">📅 Data e ora</span>
              <span className="event-detail__info-value">{event.date}</span>
            </div>
            <div className="event-detail__info-item">
              <span className="event-detail__info-label">📍 Dove</span>
              <span className="event-detail__info-value">{event.location}</span>
            </div>
            <div className="event-detail__info-item">
              <span className="event-detail__info-label">🎟️ Prezzo</span>
              <span className="event-detail__info-value">{event.price}</span>
            </div>
            <div className="event-detail__info-item">
              <span className="event-detail__info-label">🐝 BEES</span>
              <span className="event-detail__info-value">+{event.bees} BEES</span>
            </div>
          </div>
        </section>

        {/* ── Associated restaurant ── */}
        {restaurant && (
          <section className="event-detail__section">
            <h2>Il locale</h2>
            <Link href={`/restaurants/${restaurant.slug}`} className="event-detail__venue-card">
              <div className="event-detail__venue-img-wrap">
                <Image
                  src={restaurant.heroImage}
                  alt={restaurant.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="event-detail__venue-img"
                />
              </div>
              <div className="event-detail__venue-info">
                <h3>{restaurant.name}</h3>
                <p className="event-detail__venue-cuisine">{restaurant.cuisine}</p>
                <p className="event-detail__venue-address">{restaurant.address}</p>
                <div className="event-detail__venue-meta">
                  <span>⭐ {restaurant.rating} ({restaurant.reviewCount})</span>
                  <span>{restaurant.priceRange}</span>
                  {restaurant.discount && (
                    <span className="event-detail__venue-discount">−{restaurant.discount}%</span>
                  )}
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ── Biglietti ── */}
        <section className="event-detail__section" id="biglietti">
          <h2>Biglietti</h2>
          <TicketPurchaseForm event={event} />
        </section>

        {/* ── Back link ── */}
        <div className="event-detail__cta">
          <Link href="/events" className="event-detail__back">← Tutti gli eventi</Link>
        </div>

      </div>
    </div>
  );
}
