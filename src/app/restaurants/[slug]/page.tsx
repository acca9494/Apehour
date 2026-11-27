import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/booking/booking-panel";
import { PickupOrderPanel } from "@/components/booking/pickup-order-panel";
import { DetailHero } from "@/components/detail/detail-hero";
import { GalleryLightbox } from "@/components/detail/gallery-lightbox";
import { MapClient } from "@/components/map/map-client";
import { RestaurantCard } from "@/components/restaurant-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { getReviews } from "@/lib/services/reviews";
import { getRestaurantBySlug, getSimilarRestaurants } from "@/lib/services/restaurants";
import { formatReviewCount } from "@/lib/utils";
import { getServerT } from "@/lib/i18n/server";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) return { title: "Locale non trovato" };
  return {
    title: r.name,
    description: r.description,
  };
}

export default async function RestaurantPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const initialSlot = typeof sp.slot === "string" ? sp.slot : undefined;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const [similar, reviews, t] = await Promise.all([
    getSimilarRestaurants(restaurant.slug),
    getReviews(restaurant.id),
    getServerT(),
  ]);
  const d = t.restaurantDetail;

  return (
    <div className="detail-page">
      {/* ── 1–6. Hero cinematografico con info overlay ────────────────── */}
      <DetailHero restaurant={restaurant} t={d} />

      {/* ── Layout contenuto + pannello prenotazione sticky ──────────── */}
      <section className="detail-layout">
        <article className="detail-content">

          {/* ── 7. Descrizione + tag ───────────────────────────────────── */}
          <div className="detail-block detail-desc">
            {restaurant.description && <p className="detail-desc__text">{restaurant.description}</p>}
            <div className="detail-pills" style={{ marginTop: "1rem" }}>
              <span>{restaurant.priceRange}</span>
              <span>{restaurant.rating.toFixed(1)} ★ · {formatReviewCount(restaurant.reviewCount)} {restaurant.reviewCount === 1 ? d.review : d.reviewsPlural}</span>
              {restaurant.maxCapacity ? <span>{d.maxCapacity(restaurant.maxCapacity)}</span> : null}
              {restaurant.discount ? <span className="detail-pill--yellow">{d.discountToday(restaurant.discount)}</span> : null}
            </div>
          </div>

          {/* ── Carta e drink + Foto dei piatti ──────────────────────────── */}
          {(restaurant.menuPreview.length > 0 || restaurant.menuUrl || restaurant.menuPhotos.length > 0 || restaurant.dishPhotos.length > 0) && (
            <div className="detail-menu-row">
              {(restaurant.menuPreview.length > 0 || restaurant.menuUrl || restaurant.menuPhotos.length > 0) && (
                <section className="detail-block detail-menu-row__col">
                  <h2>{d.menu}</h2>
                  {restaurant.menuPreview.length > 0 && (
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
                  )}
                  {restaurant.menuUrl && (
                    <a href={restaurant.menuUrl} target="_blank" rel="noopener noreferrer" className="clay-button clay-button--secondary">
                      {d.viewMenu}
                    </a>
                  )}
                  {restaurant.menuPhotos.length > 0 && (
                    <div style={{ marginTop: restaurant.menuUrl ? "1rem" : 0 }}>
                      <GalleryLightbox images={restaurant.menuPhotos} name={`${restaurant.name} — menu`} />
                    </div>
                  )}
                </section>
              )}

              {restaurant.dishPhotos.length > 0 && (
                <section className="detail-block detail-menu-row__col">
                  <h2>{d.dishPhotos}</h2>
                  <GalleryLightbox images={restaurant.dishPhotos} name={`${restaurant.name} — piatti`} />
                </section>
              )}
            </div>
          )}

          {/* ── 8. Punti forti ────────────────────────────────────────── */}
          {(restaurant.urgencyLabel || restaurant.socialProof || restaurant.menuPreview.length > 0 || restaurant.tags.length > 0) && (
            <section className="detail-block">
              <h2>{d.whyBookHere}</h2>
              <div className="highlight-grid">
                {(restaurant.urgencyLabel || restaurant.socialProof) && (
                  <div>
                    <strong>{d.atmosphere}</strong>
                    <p>{[restaurant.urgencyLabel, restaurant.socialProof].filter(Boolean).join(" — ")}</p>
                  </div>
                )}
                {restaurant.menuPreview.length > 0 && (
                  <div>
                    <strong>{d.drinksAndFood}</strong>
                    <p>
                      {restaurant.menuPreview
                        .slice(0, 2)
                        .map((i) => i.name)
                        .join(", ")} {d.andOtherClassics(restaurant.menuPreview.length)}
                    </p>
                  </div>
                )}
                {restaurant.tags.length > 0 && (
                  <div>
                    <strong>{d.idealFor}</strong>
                    <p>{restaurant.tags.join(", ")}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Booking panel inline — mobile only, before gallery ──── */}
          <div className="detail-booking-mobile">
            <BookingPanel restaurant={restaurant} initialSlot={initialSlot} />
          </div>

          {/* ── 9. Gallery strip ───────────────────────────────────────── */}
          {restaurant.gallery.length > 0 && (
            <section className="detail-block detail-gallery-strip" aria-label={d.gallery}>
              <h2>{d.gallery}</h2>
              <GalleryLightbox images={restaurant.gallery} name={restaurant.name} />
            </section>
          )}

          {(restaurant.videoUrl || restaurant.facebook || restaurant.instagram || restaurant.website) && (
            <div className="detail-video-link" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {restaurant.website && (
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="clay-button clay-button--secondary">
                  🔗 {restaurant.websiteLabel || "Sito web"}
                </a>
              )}
              {restaurant.videoUrl && (
                <a href={restaurant.videoUrl} target="_blank" rel="noopener noreferrer" className="clay-button clay-button--secondary">
                  ▶ {d.watchVideo}
                </a>
              )}
              {restaurant.facebook && (
                <a href={restaurant.facebook} target="_blank" rel="noopener noreferrer" className="clay-button clay-button--secondary">
                  Facebook
                </a>
              )}
              {restaurant.instagram && (
                <a
                  href={restaurant.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-button clay-button--secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <InstagramIcon width={16} height={16} />
                  Instagram
                </a>
              )}
            </div>
          )}

          {(restaurant.paymentMethods.length > 0 || restaurant.accessibilityTags.length > 0) && (
            <section className="detail-block split-block">
              {restaurant.paymentMethods.length > 0 && (
                <div>
                  <h2>{d.paymentMethods}</h2>
                  <div className="detail-pills">
                    {restaurant.paymentMethods.map((m) => <span key={m}>{m}</span>)}
                  </div>
                </div>
              )}
              {restaurant.accessibilityTags.length > 0 && (
                <div>
                  <h2>{d.accessibility}</h2>
                  <div className="detail-pills">
                    {restaurant.accessibilityTags.map((a) => <span key={a}>{a}</span>)}
                  </div>
                </div>
              )}
            </section>
          )}

          {restaurant.cancellationPolicy && (
            <section className="detail-block">
              <h2>{d.cancellationPolicy}</h2>
              <p>{restaurant.cancellationPolicy}</p>
            </section>
          )}

          {restaurant.pickupEnabled && (
            <PickupOrderPanel restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
          )}

          {/* ── Orari + Mappa ─────────────────────────────────────────── */}
          {(() => {
            const hasHours = restaurant.openingHours.length > 0;
            const hasCoordinates = restaurant.coordinates.lat !== 0 || restaurant.coordinates.lng !== 0;
            if (!hasHours && !hasCoordinates) return null;
            return (
              <section className="detail-block split-block">
                {hasHours && (
                  <div>
                    <h2>{d.hours}</h2>
                    <dl className="hours-list">
                      {restaurant.openingHours.map((item) => (
                        <div key={item.day}>
                          <dt>{item.day}</dt>
                          <dd>{item.hours}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                {hasCoordinates && (
                  <div className="detail-map-wrap">
                    <MapClient
                      center={restaurant.coordinates}
                      zoom={15}
                      markers={[{
                        lat: restaurant.coordinates.lat,
                        lng: restaurant.coordinates.lng,
                        label: restaurant.name,
                        slug: restaurant.slug,
                        image: restaurant.heroImage,
                        neighborhood: restaurant.neighborhood,
                        cuisine: restaurant.cuisine,
                        budget: restaurant.priceRange,
                        rating: restaurant.rating,
                      }]}
                      className="detail-map-iframe"
                    />
                  </div>
                )}
              </section>
            );
          })()}

          {/* ── Recensioni ────────────────────────────────────────────── */}
          {reviews.length > 0 && (
            <section className="detail-block">
              <h2>{d.whatCustomersSay}</h2>
              <p className="detail-verified-badge">{d.verifiedReviews}</p>
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
            <h2>{d.faq}</h2>
            <div className="detail-faq-grid">
              <div className="detail-faq-item">
                <strong>{d.faqCancel}</strong>
                <p>{d.faqCancelA}</p>
              </div>
              <div className="detail-faq-item">
                <strong>{d.faqCard}</strong>
                <p>{d.faqCardA}</p>
              </div>
              <div className="detail-faq-item">
                <strong>{d.faqConfirm}</strong>
                <p>{d.faqConfirmA}</p>
              </div>
              <div className="detail-faq-item">
                <strong>{d.faqChange}</strong>
                <p>{d.faqChangeA}</p>
              </div>
            </div>
          </section>

        </article>

        {/* ── 10–14. Box prenotazione sticky — desktop only ─────────── */}
        <div className="detail-booking-desktop">
          <BookingPanel restaurant={restaurant} initialSlot={initialSlot} />
        </div>
      </section>

      {/* ── Locali simili ─────────────────────────────────────────────── */}
      <section className="page-section">
        <SectionHeading eyebrow={d.discoverAlso} title={d.similarVenues}>
          {d.similarVenuesSub}
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
