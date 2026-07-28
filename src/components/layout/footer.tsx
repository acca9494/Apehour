"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useLang();
  const f = t.footer;
  return (
    <footer className="site-footer">
      <div className="footer-body">

        {/* ── Brand ── */}
        <div className="footer-brand">
          <Link className="brand" href="/">
            <span className="brand__mark" aria-hidden="true">
              <Image src="/apeapplogo1.png" alt="" width={200} height={200} className="brand__logo-img" />
            </span>
            <span className="brand__text">
              Ape<span className="brand__text-accent">Hour</span>
            </span>
          </Link>
          <p className="footer-brand__desc">{f.desc}</p>
          <div className="footer-trust">
            <Link href="/cookie-policy" className="footer-trust__link">Cookie policy</Link>
            <Link href="/privacy" className="footer-trust__link">Privacy policy</Link>
          </div>
        </div>

        {/* ── Explore ── */}
        <div className="footer-col">
          <p className="footer-col__label">{f.exploreLabel}</p>
          <nav>
            <Link href="/search">{f.findVenues}</Link>
            <Link href="/booking">{f.bookAperitivo}</Link>
            <Link href="/events">{f.events}</Link>
            <Link href="/favorites">{f.favorites}</Link>
          </nav>
        </div>

        {/* ── Account ── */}
        <div className="footer-col">
          <p className="footer-col__label">{f.accountLabel}</p>
          <nav>
            <Link href="/login">{f.login}</Link>
            <Link href="/register">{f.register}</Link>
            <Link href="/profile">{f.myProfile}</Link>
          </nav>
        </div>

        {/* ── Venues ── */}
        <div className="footer-col">
          <p className="footer-col__label">{f.venueLabel}</p>
          <nav>
            <Link href="/#per-i-locali">{f.registerVenue}</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/come-funziona">{f.howItWorks}</Link>
          </nav>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ApeHour — {f.copyright}</span>
        <div className="footer-bottom__links">
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/cookie-policy">Cookie policy</Link>
          <button type="button" className="footer-cookie-reset" onClick={() => { try { localStorage.removeItem("apehour_cookie_consent"); window.location.reload(); } catch {} }}>
            {f.manageCookies}
          </button>
        </div>
      </div>
    </footer>
  );
}
