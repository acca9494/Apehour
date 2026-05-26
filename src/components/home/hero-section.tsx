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

function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function ZapIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z" />
    </svg>
  );
}
function TagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.5 2H7a2 2 0 0 0-2 2v5.5a1 1 0 0 0 .3.7l9 9a2 2 0 0 0 2.8 0l4.7-4.7a2 2 0 0 0 0-2.8l-9-9A1 1 0 0 0 12.5 2Z" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ShieldCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 4 6v6c0 5 3.6 9.3 8 10.3C16.4 21.3 20 17 20 12V6L12 2Z" />
      <path d="m9 12 2.2 2.2L15 9" />
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
  { title: "Prenota in 1 minuto",    Icon: ClockIcon },
  { title: "Conferma immediata",     Icon: ZapIcon },
  { title: "Sconti fino al 40%",     Icon: TagIcon },
  { title: "Cancellazione gratuita", Icon: ShieldCheckIcon },
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
          {FEATURES.map(({ title, Icon }) => (
            <div className="home-hero__feature" key={title}>
              <span className="home-hero__feature-icon"><Icon aria-hidden="true" /></span>
              <div className="home-hero__feature-text">
                <strong>{title}</strong>
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
