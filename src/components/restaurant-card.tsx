import Image from "next/image";
import Link from "next/link";
import { ClayLink } from "@/components/ui/clay-button";
import type { Restaurant } from "@/lib/types";
import { formatReviewCount } from "@/lib/utils";

type RestaurantCardProps = {
  restaurant: Restaurant;
  priority?: boolean;
};

export function RestaurantCard({ restaurant, priority = false }: RestaurantCardProps) {
  const firstSlot = restaurant.slots[0];

  return (
    <article className="restaurant-card">
      <Link className="restaurant-card__image" href={`/restaurants/${restaurant.slug}`} aria-label={restaurant.name}>
        <Image
          src={restaurant.heroImage}
          alt={`${restaurant.name} dining room`}
          fill
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
        />
        {restaurant.discount ? (
          <span className="discount-badge">-{restaurant.discount}%</span>
        ) : null}
      </Link>

      <div className="restaurant-card__body">
        <div className="restaurant-card__topline">
          <span>{restaurant.cuisine}</span>
          <strong>{restaurant.rating.toFixed(1)}</strong>
        </div>

        <h3>
          <Link href={`/restaurants/${restaurant.slug}`}>{restaurant.name}</Link>
        </h3>

        <p className="restaurant-card__meta">
          {formatReviewCount(restaurant.reviewCount)} recensioni · {restaurant.priceRange} · {restaurant.distance}
        </p>

        <p className="trust-label">{restaurant.urgencyLabel}</p>

        <div className="slot-row" aria-label="Orari disponibili">
          {restaurant.slots.slice(0, 3).map((slot) => (
            <Link key={slot.id} href={`/booking?restaurant=${restaurant.slug}&time=${slot.time}`}>
              {slot.time}
            </Link>
          ))}
        </div>

        <div className="restaurant-card__footer">
          <span>
            {firstSlot ? `${firstSlot.availableSeats} posti alle ${firstSlot.time}` : restaurant.socialProof}
          </span>
          <ClayLink href={`/restaurants/${restaurant.slug}`}>Prenota</ClayLink>
        </div>
      </div>
    </article>
  );
}
