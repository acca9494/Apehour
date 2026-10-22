import Image from "next/image";
import Link from "next/link";
import type { Restaurant } from "@/lib/types";
import { formatReviewCount } from "@/lib/utils";
import { FavoriteHeartButton } from "@/components/favorites/favorite-heart-button";
import type { getServerT } from "@/lib/i18n/server";

function Stars({ rating, label }: { rating: number; label: string }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className="star-row" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full ? "full" : i === full && half ? "half" : "empty";
        return (
          <span key={i} className={`star star--${filled}`} aria-hidden="true">
            ★
          </span>
        );
      })}
    </span>
  );
}

export function DetailHero({ restaurant, t }: { restaurant: Restaurant; t: Awaited<ReturnType<typeof getServerT>>["restaurantDetail"] }) {
  return (
    <div className="detail-hero">
      <Link href="/search" className="detail-back-btn" aria-label={t.backToSearch}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <FavoriteHeartButton restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />

      {/* Background image */}
      <div className="detail-hero__img">
        <Image
          src={restaurant.heroImage}
          alt={restaurant.name}
          fill
          priority
          sizes="100vw"
        />
      </div>

      {/* Gradient overlay */}
      <div className="detail-hero__overlay" />

      {/* Content overlaid at bottom */}
      <div className="detail-hero__content">
        {/* Urgency badge */}
        {restaurant.urgencyLabel && (
          <span className="detail-hero__urgency">
            ⚡ {restaurant.urgencyLabel}
          </span>
        )}

        {/* Eyebrow */}
        <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>
          {restaurant.cuisine} · {restaurant.neighborhood}
        </p>

        {/* Name */}
        <h1 className="detail-hero__name">{restaurant.name}</h1>

        {/* Meta row */}
        <div className="detail-hero__meta">
          <span className="detail-hero__rating">
            <Stars rating={restaurant.rating} label={t.outOf5(restaurant.rating)} />
            <strong>{restaurant.rating.toFixed(1)}</strong>
            <span className="detail-hero__review-count">
              ({formatReviewCount(restaurant.reviewCount)} {t.reviewsPlural})
            </span>
          </span>

          <span className="detail-hero__sep" aria-hidden="true">·</span>

          <span className="detail-hero__price">{restaurant.priceRange}</span>

          <span className="detail-hero__sep" aria-hidden="true">·</span>

          <span>{restaurant.city}</span>

          {restaurant.distance && (
            <>
              <span className="detail-hero__sep" aria-hidden="true">·</span>
              <span>{restaurant.distance}</span>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="detail-hero__tags">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="detail-hero__tag">{tag}</span>
          ))}
          {restaurant.discount && (
            <span className="detail-hero__tag detail-hero__tag--discount">
              {t.discountToday(restaurant.discount)}
            </span>
          )}
        </div>
      </div>

      {/* Type badge — bottom right, only the one matching this venue's price tier */}
      <div className="detail-hero__type-badges">
        {restaurant.priceRange === "$$" && (
          <img src="/vespa-v2.png" alt="Vespa Sprint" className="detail-hero__type-badge" />
        )}
        {restaurant.priceRange === "$$$" && (
          <img src="/plus-v2.png" alt="Ape Plus" className="detail-hero__type-badge" />
        )}
        {restaurant.priceRange === "$$$$" && (
          <img src="/bombo-v2.png" alt="Bombo Queen" className="detail-hero__type-badge" />
        )}
      </div>
    </div>
  );
}
