import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/data/events";
import { restaurants } from "@/lib/data/restaurants";
import { BookingPanel } from "@/components/booking/booking-panel";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Evento non trovato" };
  return {
    title: `${event.title} — ApeHour`,
    description: event.description,
  };
}

export async function generateStaticParams() {
  const { EVENTS } = await import("@/lib/data/events");
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const restaurant = restaurants.find((r) => r.slug === event.restaurantSlug);

  return (
    <div className="event-detail">

      {/* ── Hero ── */}
      <div className="event-detail__hero">
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

        {/* ── Booking ── */}
        {restaurant && (
          <section className="event-detail__section" id="prenota">
            <h2>Prenota</h2>
            <BookingPanel restaurant={restaurant} />
          </section>
        )}

        {/* ── Back link ── */}
        <div className="event-detail__cta">
          <Link href="/events" className="event-detail__back">← Tutti gli eventi</Link>
        </div>

      </div>
    </div>
  );
}
