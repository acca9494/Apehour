"use client";

import { useEffect, useRef } from "react";
import type { SVGProps } from "react";
import { HeroSearchForm } from "@/components/search/hero-search-form";

type IconProps = SVGProps<SVGSVGElement>;

function BrandIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.6 19.1 6.8v8.4L12 19.4 4.9 15.2V6.8L12 2.6Z" />
      <path d="m12 6.2 4 2.3v4.9l-4 2.3-4-2.3V8.5l4-2.3Z" />
      <path d="m8.1 10.2 3.9 2.3 3.9-2.3" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 12 4.2 4.2L19 6.5" />
    </svg>
  );
}
function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 4 2.5 5 5.5.8-4 3.9 1 5.5L12 16.5 7 19.2l1-5.5-4-3.9 5.5-.8L12 4Z" />
    </svg>
  );
}
function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="6.5" width="16" height="13" rx="2.5" />
      <path d="M4 10.5h16M7 3.5v3M17 3.5v3" />
    </svg>
  );
}
function PercentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 18 12-12" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}
function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const FEATURES = [
  { title: "Prenota in 30 secondi",  copy: "Niente telefonate, niente attese",   Icon: CheckIcon },
  { title: "Solo bar da 10",         copy: "Selezionati, verificati, adorati",    Icon: StarIcon },
  { title: "Cancella quando vuoi",   copy: "Zero penali, zero stress",            Icon: CalendarIcon },
  { title: "Sconti fino al 40%",     copy: "Solo per chi prenota su ApeHour",     Icon: PercentIcon },
];

// speed: how many px to move per 100px of scroll (negative = move up slower)
const HEX_LEFT = [
  { src: "https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=360&q=80", alt: "Martini",      cls: "hhi--l1", speed: -0.12 },
  { src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=360&q=80", alt: "Coupe",        cls: "hhi--l2", speed: -0.18 },
];
const HEX_RIGHT = [
  { src: "https://images.unsplash.com/photo-1470338745628-171cf53de3a8?auto=format&fit=crop&w=360&q=80", alt: "Old fashioned", cls: "hhi--r1", speed: -0.15 },
  { src: "https://images.unsplash.com/photo-1560508180-03f285f67ded?auto=format&fit=crop&w=360&q=80", alt: "Pink cocktail",  cls: "hhi--r2", speed: -0.09 },
];

const ALL_HEXES = [...HEX_LEFT, ...HEX_RIGHT];

export function HeroSection() {
  const hexRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        hexRefs.current.forEach((el, i) => {
          if (!el) return;
          const speed = ALL_HEXES[i]?.speed ?? -0.12;
          el.style.setProperty("--parallax-y", `${y * speed}px`);
        });
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="home-hero">

      {/* Hexagonal deco images — absolutely positioned */}
      <div className="home-hero__hexes" aria-hidden="true">
        {ALL_HEXES.map(({ src, alt, cls }, i) => (
          <div
            key={cls}
            className={`hhi ${cls}`}
            ref={(el) => { hexRefs.current[i] = el; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} />
          </div>
        ))}
      </div>

      <div className="home-hero__shell">
        <div className="home-hero__content">

          <div className="home-hero__badge">
            <BrandIcon className="home-hero__badge-icon" aria-hidden="true" />
            <span>Prenota, gusta, vivi</span>
          </div>

          <div className="home-hero__title-wrap">
            <div className="home-hero__title-glow" aria-hidden="true" />
            <h1>
              È sempre l&apos;ora dell&apos;<span>Ape…</span> da qualche parte
            </h1>
          </div>

          <HeroSearchForm />
        </div>

        <div className="home-hero__features">
          {FEATURES.map(({ title, copy, Icon }) => (
            <div className="home-hero__feature" key={title}>
              <span className="home-hero__feature-icon"><Icon aria-hidden="true" /></span>
              <div className="home-hero__feature-text">
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-hero__scroll" aria-hidden="true">
        <ChevronDownIcon className="home-hero__scroll-icon" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
