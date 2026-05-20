import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapClient } from "@/components/map/map-client";
import { BookingPanel } from "@/components/booking/booking-panel";
import { DetailHero } from "@/components/detail/detail-hero";
import { RestaurantCard } from "@/components/restaurant-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { restaurants } from "@/lib/data/restaurants";
import { getMapPreview } from "@/lib/services/maps";
import { getReviews } from "@/lib/services/reviews";
import { getRestaurantBySlug, getSimilarRestaurants } from "@/lib/services/restaurants";
import { formatReviewCount } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return restaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) return { title: "Locale non trovato" };
  return {
    title: r.name,
    description: r.description,
  };
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const [similar, reviews, mapPreview] = await Promise.all([
    getSimilarRestaurants(restaurant.slug),
    getReviews(restaurant.id),
    getMapPreview(restaurant.id),
  ]);

  return (
    <div className="detail-page">
      {/* ── 1–6. Hero cinematografico con info overlay ────────────────── */}
      <DetailHero restaurant={restaurant} />

      {/* ── Layout contenuto + pannello prenotazione sticky ──────────── */}
      <section className="detail-layout">
        <article className="detail-content">

          {/* ── 7. Descrizione + tag ───────────────────────────────────── */}
          <div className="detail-block detail-desc">
            <p className="detail-desc__text">{restaurant.description}</p>
            <div className="detail-pills" style={{ marginTop: "1rem" }}>
              <span>{restaurant.priceRange}</span>
              <span>{restaurant.rating.toFixed(1)} ★ · {formatReviewCount(restaurant.reviewCount)} rec.</span>
              {restaurant.discount ? <span className="detail-pill--yellow">-{restaurant.discount}% oggi</span> : null}
            </div>
          </div>

          {/* ── 8. Punti forti ────────────────────────────────────────── */}
          <section className="detail-block">
            <h2>Perché prenotare qui</h2>
            <div className="highlight-grid">
              <div>
                <strong>L&apos;atmosfera</strong>
                <p>{restaurant.urgencyLabel} — {restaurant.socialProof}</p>
              </div>
              <div>
                <strong>Drink &amp; cibo</strong>
                <p>
                  {restaurant.menuPreview
                    .slice(0, 2)
                    .map((i) => i.name)
                    .join(", ")} e altri {restaurant.menuPreview.length} classici.
                </p>
              </div>
              <div>
                <strong>Ideale per</strong>
                <p>{restaurant.tags.join(", ")}</p>
              </div>
            </div>
          </section>

          {/* ── 9. Gallery strip ───────────────────────────────────────── */}
          {restaurant.gallery.length > 0 && (
            <section className="detail-block detail-gallery-strip" aria-label="Galleria foto">
              <h2>Guarda il locale</h2>
              <div className="gallery-strip">
                {restaurant.gallery.map((img, i) => (
                  <div key={img} className="gallery-strip__tile">
                    <Image
                      src={img}
                      alt={`${restaurant.name} foto ${i + 1}`}
                      fill
                      sizes="(max-width: 760px) 80vw, 30vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Carta e drink ─────────────────────────────────────────── */}
          <section className="detail-block">
            <h2>Carta e drink</h2>
            <div className="menu-list">
              {restaurant.menuPreview.map((item) => (
                <div key={item.name}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <strong>€{item.price}</strong>
                </div>
              ))}
            </div>
          </section>

          {/* ── Orari + Mappa ─────────────────────────────────────────── */}
          <section className="detail-block split-block">
            <div>
              <h2>Orari aperitivo</h2>
              <dl className="hours-list">
                {restaurant.openingHours.map((item) => (
                  <div key={item.day}>
                    <dt>{item.day}</dt>
                    <dd>{item.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="detail-map-wrap">
              <MapClient
                center={mapPreview.coordinates}
                zoom={15}
                markers={[{
                  lat: mapPreview.coordinates.lat,
                  lng: mapPreview.coordinates.lng,
                  label: restaurant.name,
                  popupHtml: `<a href="#" style="font-weight:800;font-size:0.9rem;color:#222">${restaurant.name}</a><br/><span style="font-size:0.78rem;color:#888">${restaurant.address}</span>`,
                }]}
              />
            </div>
          </section>

          {/* ── Recensioni ────────────────────────────────────────────── */}
          {reviews.length > 0 && (
            <section className="detail-block">
              <h2>Cosa dicono i clienti</h2>
              <div className="testimonial-grid">
                {reviews.map((rev) => (
                  <blockquote className="testimonial-card" key={rev.id}>
                    <p>{rev.body}</p>
                    <footer>
                      <strong>{rev.author}</strong>
                      <span>{"★".repeat(Math.round(rev.rating))} {rev.rating.toFixed(1)}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* ── 15. FAQ ───────────────────────────────────────────────── */}
          <section className="detail-block detail-faq-section">
            <h2>Domande frequenti</h2>
            <div className="detail-faq-grid">
              <div className="detail-faq-item">
                <strong>Posso cancellare la prenotazione?</strong>
                <p>Sì, cancellazione gratuita fino a 2 ore prima. Basta accedere alle tue prenotazioni e premere Annulla.</p>
              </div>
              <div className="detail-faq-item">
                <strong>Serve una carta di credito?</strong>
                <p>No. La prenotazione è gratuita. La caparra è indicata chiaramente solo se il locale la richiede.</p>
              </div>
              <div className="detail-faq-item">
                <strong>Come ricevo la conferma?</strong>
                <p>Via email subito dopo aver premuto &quot;Prenota il tavolo&quot;. Controlla anche lo spam se non arriva.</p>
              </div>
              <div className="detail-faq-item">
                <strong>Posso modificare dopo aver prenotato?</strong>
                <p>Puoi cancellare e riprenotare gratuitamente. Per modifiche urgenti, contatta direttamente il locale.</p>
              </div>
            </div>
          </section>

        </article>

        {/* ── 10–14. Box prenotazione sticky ────────────────────────── */}
        <BookingPanel restaurant={restaurant} />
      </section>

      {/* ── Locali simili ─────────────────────────────────────────────── */}
      <section className="page-section">
        <SectionHeading eyebrow="Scopri anche" title="Altri locali che potrebbero piacerti">
          Stessa qualità, orari ancora disponibili.
        </SectionHeading>
        <div className="restaurant-grid">
          {similar.map((item) => (
            <RestaurantCard restaurant={item} key={item.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
