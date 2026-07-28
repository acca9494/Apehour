import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { promotions } from "@/lib/data/restaurants";
import { restaurants } from "@/lib/data/restaurants";

export const metadata: Metadata = {
  title: "Offerte — ApeHour",
  description: "Tutte le offerte attive sui migliori locali. Prenota e risparmia fino al 40%.",
};

const APE_LABEL: Record<string, string> = {
  "vespa-sprint": "Vespa Sprint",
  "ape-plus": "Ape Plus",
  "bombo-queen": "Bombo Queen",
};

const APE_COLOR: Record<string, string> = {
  "vespa-sprint": "#f59e0b",
  "ape-plus": "#3b82f6",
  "bombo-queen": "#8b5cf6",
};

export default function OffersPage() {
  return (
    <div className="offers-page">

      <div className="offers-page__header">
        <span className="eyebrow">Offerte attive</span>
        <h1>Prenota e risparmia</h1>
        <p className="offers-page__sub">Sconti esclusivi sui migliori locali. Disponibilità limitata.</p>
      </div>

      <div className="offers-page__grid">
        {promotions.map((promo) => {
          const restaurant = restaurants.find((r) => r.slug === promo.restaurantSlug);
          if (!restaurant) return null;
          return (
            <Link
              key={promo.id}
              href={`/restaurants/${restaurant.slug}`}
              className="offer-detail-card"
            >
              <div className="offer-detail-card__img-wrap">
                <Image
                  src={restaurant.heroImage}
                  alt={restaurant.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="offer-detail-card__img"
                />
                <span
                  className="offer-detail-card__discount"
                  style={{ background: promo.apeType ? APE_COLOR[promo.apeType] : "var(--gold)" }}
                >
                  -{promo.discount}%
                </span>
                {promo.apeType && (
                  <span className="offer-detail-card__ape-badge">
                    {APE_LABEL[promo.apeType]}
                  </span>
                )}
              </div>
              <div className="offer-detail-card__body">
                <div className="offer-detail-card__venue">
                  <h2>{restaurant.name}</h2>
                  <span className="offer-detail-card__cuisine">{restaurant.cuisine}</span>
                </div>
                <h3 className="offer-detail-card__promo-title">{promo.title}</h3>
                <p className="offer-detail-card__desc">{promo.description}</p>
                <div className="offer-detail-card__meta">
                  <span className="offer-detail-card__rating">⭐ {restaurant.rating} ({restaurant.reviewCount})</span>
                  <span className="offer-detail-card__address">{restaurant.address}</span>
                </div>
                <span className="offer-detail-card__cta">Prenota con sconto →</span>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
