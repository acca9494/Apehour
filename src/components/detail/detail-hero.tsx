import Image from "next/image";
import type { Restaurant } from "@/lib/types";
import { formatReviewCount } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className="star-row" aria-label={`${rating} su 5`}>
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

export function DetailHero({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="detail-hero">
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
            <Stars rating={restaurant.rating} />
            <strong>{restaurant.rating.toFixed(1)}</strong>
            <span className="detail-hero__review-count">
              ({formatReviewCount(restaurant.reviewCount)} recensioni)
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
              -{restaurant.discount}% oggi
            </span>
          )}
        </div>
      </div>

      {/* Type badges — bottom right */}
      <div className="detail-hero__type-badges">
        <img src="/bombo.jpeg" alt="Bombo Queen" className="detail-hero__type-badge" />
        <img src="/vespa.jpeg" alt="Vespa Sprint" className="detail-hero__type-badge" />
        <img src="/plus.jpeg"  alt="Ape Plus"    className="detail-hero__type-badge" />
      </div>
    </div>
  );
}
