"use client";

import Link from "next/link";
import { ClayLink } from "@/components/ui/clay-button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import Image from "next/image";
import type { Promotion, Review } from "@/lib/types";
import { MerchantRegisterForm } from "@/components/home/merchant-register-form";
import { ApeCardLink } from "@/components/home/ape-card-link";
import { useLang } from "@/lib/i18n/context";
import { EVENTS } from "@/lib/data/events";

type HomeSectionsProps = {
  promotions: Promotion[];
  reviews: Review[];
};

const categories = [
  {
    label: "Pulizia Spiaggia",
    copy: "Raccogli rifiuti sul litorale con il tuo gruppo. Poi aperitivo offerto dai locali partner.",
    href: "/attivita",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    bees: 30,
    tag: "Ambiente",
  },
  {
    label: "Pulizia Parchi Urbani",
    copy: "Un'ora di verde pulito in città. Guanti, sacchi e buona compagnia — aperitivo a fine turno.",
    href: "/attivita",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    bees: 25,
    tag: "Verde urbano",
  },
  {
    label: "Pulizia Fiume",
    copy: "Lungo le rive con stivali e voglia di fare. La città ti guarda — i BEES anche.",
    href: "/attivita",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    bees: 25,
    tag: "Fiumi",
  },
  {
    label: "Plogging Aperitivo",
    copy: "Corri, raccoglie, brinda. Il jogging più buono d'Italia — +35 BEES garantiti.",
    href: "/attivita",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80",
    bees: 35,
    tag: "Sport & Natura",
  },
];


const HOME_EVENTS = EVENTS.filter((e) =>
  ["jazz-navigli", "dj-rooftop-roma", "vini-naturali-firenze", "mezcal-torino"].includes(e.slug)
);

const APE_IMG: Record<string, string> = {
  "vespa-sprint": "/vespa-v2.png",
  "ape-plus":     "/plus-v2.png",
  "bombo-queen":  "/bombo-v2.png",
};
const APE_BUDGET: Record<string, string> = {
  "vespa-sprint": "€",
  "ape-plus":     "€€",
  "bombo-queen":  "€€€",
};
const APE_LABEL: Record<string, string> = {
  "vespa-sprint": "Vespa Sprint",
  "ape-plus":     "Ape Plus",
  "bombo-queen":  "Bombo Queen",
};
const APE_PRICE_RANGE: Record<string, string> = {
  "vespa-sprint": "$$",
  "ape-plus":     "$$$",
  "bombo-queen":  "$$$$",
};

export function OffersSection({ promotions }: { promotions: Promotion[] }) {
  const { t } = useLang();
  const h = t.home;
  return (
    <section className="page-section page-section--dark page-section--offers">
      <div className="offers-header">
        <span className="eyebrow offers-header__eyebrow--desktop">{h.offersEyebrow}</span>
        <span className="offers-savings-badge offers-header__badge--desktop">{h.save40}</span>
        <span className="eyebrow offers-header__eyebrow--mobile">{h.bookNowEyebrow}</span>
        <h2 className="offers-header__title--mobile">{h.chooseTitle[0]}<span style={{ color: "var(--gold)" }}>{h.chooseTitle[1]}</span>{h.chooseTitle[2]}</h2>
      </div>
      <div className="offer-grid">
        {promotions.map((promotion) => (
          <div className="offer-card" key={promotion.id}>
            {promotion.apeType && (
              <ApeCardLink priceRange={APE_PRICE_RANGE[promotion.apeType]}>
                <span className="offer-card__ape-name">{APE_LABEL[promotion.apeType]}</span>
                <span className={`offer-card__ape-budget offer-card__ape-budget--${promotion.apeType}`}>{APE_BUDGET[promotion.apeType]}</span>
                <div className="offer-card__ape-img-slot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={APE_IMG[promotion.apeType]} alt={APE_LABEL[promotion.apeType]} className={`offer-card__ape-img offer-card__ape-img--${promotion.apeType}`} />
                </div>
              </ApeCardLink>
            )}
            <Link className="offer-card__desktop" href={`/restaurants/${promotion.restaurantSlug}`}>
              <span>-{promotion.discount}%</span>
              <h3>{promotion.title}</h3>
              <p>{promotion.description}</p>
              <strong>{h.bookOffer}</strong>
            </Link>
          </div>
        ))}
      </div>
      <div className="section-cta section-cta--desktop">
        <ClayLink href="/offers" variant="secondary">Tutte le offerte</ClayLink>
      </div>
      <Link href="/offers" className="section-cta-link section-cta-link--mobile">Dai un&apos;occhiata alle nostre offerte →</Link>
    </section>
  );
}

export function EventsSection() {
  const { t } = useLang();
  const h = t.home;
  return (
    <section className="page-section page-section--with-deco">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/apeapplogo1.png" alt="" className="section-deco-logo" aria-hidden="true" />
      <SectionHeading eyebrow={h.eventsEyebrow} title={h.eventsTitle}>
        <span className="events-copy-desktop">{h.eventsCopyDesktop}</span>
      </SectionHeading>
      <div className="event-grid">
        {HOME_EVENTS.map((event, index) => (
          <Reveal key={event.id} delay={index * 70}>
            <Link className="event-card" href={`/events/${event.slug}`}>
              <div className="event-card__image">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <span className="event-card__category">{event.category}</span>
              </div>
              <div className="event-card__body">
                <h3>{event.title}</h3>
                <p>{event.date} · {event.location}</p>
                <strong>{event.price}</strong>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="section-cta">
        <ClayLink href="/events" variant="secondary">{h.allEvents}</ClayLink>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  const { t } = useLang();
  const h = t.home;
  return (
    <section className="page-section page-section--activities">
      <SectionHeading eyebrow={h.activitiesEyebrow} title={h.activitiesTitle}>
        <span className="activities-copy-desktop">{h.activitiesCopyDesktop}</span>
        <span className="activities-copy-mobile">{h.activitiesCopyMobile}</span>
      </SectionHeading>
      <div className="event-grid">
        {categories.map((cat) => (
          <Link className="event-card" href={cat.href} key={cat.label}>
            <div className="event-card__image">
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <span className="event-card__category">{cat.tag}</span>
              <span className="act-card__bees">+{cat.bees} 🐝 BEES</span>
            </div>
            <div className="event-card__body">
              <h3>{cat.label}</h3>
              <p>{cat.copy}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="section-cta">
        <ClayLink href="/attivita" variant="secondary">{h.allActivities}</ClayLink>
      </div>
    </section>
  );
}

export function SocialProofSection({ reviews }: { reviews: Review[] }) {
  const { t } = useLang();
  const doubled = [...reviews, ...reviews];
  return (
    <section className="page-section social-proof">
      <div className="reviews-layout">
        <p className="eyebrow reviews-eyebrow">{t.home.reviewsEyebrow}</p>
        <div className="reviews-track-outer">
          <div className="reviews-track">
            {doubled.map((review, i) => (
              <blockquote key={i} className="testimonial-card">
                <p>{review.body}</p>
                <footer>
                  <strong>{review.author}</strong>
                  <span>{"★".repeat(Math.round(review.rating))} {review.rating.toFixed(1)}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MerchantSection() {
  const { t } = useLang();
  const h = t.home;
  return (
    <section className="merchant-section" id="per-i-locali">
      <div className="merchant-section__inner">
        <div className="merchant-section__copy">
          <p className="eyebrow merchant-section__eyebrow">{h.merchantEyebrow}</p>
          <h2>{h.merchantTitle}</h2>
          <p className="merchant-section__sub">
            {h.merchantSub[0]}<strong style={{ color: "#fff" }}>{h.merchantSub[1]}</strong>{h.merchantSub[2]}
          </p>
          <ul className="merchant-section__list">
            {h.merchantBenefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="merchant-section__form-wrap-outer">
          <div className="merchant-section__form-wrap">
            <p className="merchant-section__form-label">{h.trialLabel}</p>
            <MerchantRegisterForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSections({ promotions, reviews }: HomeSectionsProps) {
  return (
    <>
      <OffersSection promotions={promotions} />
      <EventsSection />
      <CategoriesSection />
      <MerchantSection />
      <SocialProofSection reviews={reviews} />
    </>
  );
}
