import Link from "next/link";
import { ClayLink } from "@/components/ui/clay-button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import Image from "next/image";
import type { Promotion, Review } from "@/lib/types";
import { MerchantRegisterForm } from "@/components/home/merchant-register-form";

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


const MOCK_EVENTS = [
  {
    id: "e1",
    title: "Aperitivo con Live Jazz",
    date: "Sab 10 Mag · 18:00",
    location: "Milano, Navigli",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    category: "Musica Live",
    price: "da €15",
    slug: "jazz-navigli",
  },
  {
    id: "e2",
    title: "Sunset DJ Set Rooftop",
    date: "Dom 11 Mag · 17:30",
    location: "Roma, Prati",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    category: "DJ Set",
    price: "da €20",
    slug: "dj-rooftop-roma",
  },
  {
    id: "e3",
    title: "Degustazione Vini Naturali",
    date: "Ven 9 Mag · 19:00",
    location: "Firenze, Oltrarno",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    category: "Degustazione",
    price: "da €25",
    slug: "vini-naturali-firenze",
  },
  {
    id: "e4",
    title: "Cocktail Night: Mezcal & Amaro",
    date: "Gio 8 Mag · 20:00",
    location: "Torino, Quadrilatero",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    category: "Cocktail",
    price: "da €18",
    slug: "mezcal-torino",
  },
];

export function OffersSection({ promotions }: { promotions: Promotion[] }) {
  return (
    <section className="page-section page-section--dark page-section--offers">
      <div className="offers-header">
        <span className="eyebrow">Offerte</span>
        <span className="offers-savings-badge">Risparmia fino al 40%</span>
      </div>
      <div className="offer-grid">
        {promotions.map((promotion) => (
          <Link className="offer-card" href={`/restaurants/${promotion.restaurantSlug}`} key={promotion.id}>
            <span>-{promotion.discount}%</span>
            <h3>{promotion.title}</h3>
            <p>{promotion.description}</p>
            <strong>Prenota l&apos;offerta</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function EventsSection() {
  return (
    <section className="page-section page-section--with-deco">
      <img src="/apeapplogo1.png" alt="" className="section-deco-logo" aria-hidden="true" />
      <SectionHeading eyebrow="Eventi" title="Scegli l'evento che fa per te," />
      <div className="event-grid">
        {MOCK_EVENTS.map((event, index) => (
          <Reveal key={event.id} delay={index * 70}>
            <Link className="event-card" href={`/search?event=${event.slug}`}>
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
        <ClayLink href="/search" variant="secondary">Tutti gli eventi</ClayLink>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="page-section">
      <SectionHeading eyebrow="Attività" title="Partecipa e guadagna BEES:">
        Pulisci una spiaggia, un parco, un fiume — poi meritati l&apos;aperitivo. Ogni attività ti porta BEES: i punti con cui sblocchi sconti, posti esclusivi e molto altro.
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
        <ClayLink href="/attivita" variant="secondary">Tutte le attività</ClayLink>
      </div>
    </section>
  );
}

export function SocialProofSection({ reviews }: { reviews: Review[] }) {
  const doubled = [...reviews, ...reviews];
  return (
    <section className="page-section social-proof">
      <div className="reviews-layout">
        <p className="eyebrow reviews-eyebrow">Recensioni</p>
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

const MERCHANT_BENEFITS = [
  "Visibile a migliaia di utenti nella tua città",
  "Prenotazioni in tempo reale, zero telefonate",
  "Offerte happy hour per riempire i tavoli vuoti",
  "Recensioni verificate che costruiscono fiducia",
  "Nessuna commissione per i primi 30 giorni",
];

export function MerchantSection() {
  return (
    <section className="merchant-section" id="per-i-locali">
      <div className="merchant-section__inner">
        <div className="merchant-section__copy">
          <p className="eyebrow merchant-section__eyebrow">Per i locali</p>
          <h2>Il tuo locale merita tavoli pieni ogni sera</h2>
          <p className="merchant-section__sub">
            Ogni giorno centinaia di persone cercano su ApeHour dove bere qualcosa nella tua città.
            Registrati gratis, imposta gli orari e inizia a ricevere prenotazioni reali —
            senza commissioni per i primi <strong style={{ color: "#fff" }}>30 giorni</strong>.
          </p>
          <ul className="merchant-section__list">
            {MERCHANT_BENEFITS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="merchant-section__form-wrap-outer">
          <div className="merchant-section__form-wrap">
            <p className="merchant-section__form-label">Prova gratis 30 giorni — nessuna carta richiesta</p>
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
