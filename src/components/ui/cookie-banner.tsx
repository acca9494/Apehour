"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "apehour_cookie_consent";

type ConsentValue = "all" | "essential";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  function accept(value: ConsentValue) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consenso cookie" aria-modal="false">
      <div className="cookie-banner__inner">
        <div className="cookie-banner__copy">
          <p className="cookie-banner__title">Usiamo i cookie 🍪</p>
          <p className="cookie-banner__text">
            Utilizziamo cookie tecnici essenziali per il funzionamento del sito e cookie di terze parti (mappa OpenStreetMap) per mostrarti i locali. Puoi accettare tutti i cookie o limitarli ai soli essenziali.{" "}
            <Link href="/cookie-policy" className="cookie-banner__link">Leggi la cookie policy</Link>.
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--secondary"
            onClick={() => accept("essential")}
          >
            Solo essenziali
          </button>
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--primary"
            onClick={() => accept("all")}
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
}
