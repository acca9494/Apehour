"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllActiveOffers, type PublicOffer } from "@/lib/offers/service";

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
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllActiveOffers()
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="offers-page">

      <div className="offers-page__header">
        <span className="eyebrow">Offerte attive</span>
        <h1>Prenota e risparmia</h1>
        <p className="offers-page__sub">Sconti esclusivi sui migliori locali. Disponibilità limitata.</p>
      </div>

      {loading ? (
        <p className="dash-empty">Caricamento…</p>
      ) : offers.length === 0 ? (
        <p className="dash-empty">Nessuna offerta attiva al momento.</p>
      ) : (
        <div className="offers-page__grid">
          {offers.map((promo) => (
            <Link
              key={promo.id}
              href={`/restaurants/${promo.restaurantSlug}`}
              className="offer-detail-card"
            >
              <div className="offer-detail-card__img-wrap">
                <Image
                  src={promo.restaurantImage}
                  alt={promo.restaurantName}
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
                  <h2>{promo.restaurantName}</h2>
                  <span className="offer-detail-card__cuisine">{promo.restaurantCuisine}</span>
                </div>
                <h3 className="offer-detail-card__promo-title">{promo.title}</h3>
                <p className="offer-detail-card__desc">{promo.description}</p>
                <div className="offer-detail-card__meta">
                  <span className="offer-detail-card__rating">⭐ {promo.restaurantRating} ({promo.restaurantReviewCount})</span>
                  <span className="offer-detail-card__address">{promo.restaurantAddress}</span>
                </div>
                <span className="offer-detail-card__cta">Prenota con sconto →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
