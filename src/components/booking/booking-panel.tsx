"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";
import { checkAvailability } from "@/lib/bookings/service";
import type { Restaurant } from "@/lib/types";
import { todayInputValue } from "@/lib/utils";

const FAQ = [
  {
    q: "Posso cancellare?",
    a: "Sì, cancellazione gratuita fino a 2 ore prima dell'orario prenotato.",
  },
  {
    q: "Serve la carta di credito?",
    a: "No, la prenotazione è gratuita. Se il locale richiede caparra ti verrà indicato prima di confermare.",
  },
  {
    q: "Ricevo conferma?",
    a: "Sì, conferma immediata via email non appena premi il bottone.",
  },
  {
    q: "Quanto tempo ho a tavolo?",
    a: "Lo slot dura circa 1,5–2 ore. Puoi chiedere al locale estensioni.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bp-faq-item">
      <button
        type="button"
        className="bp-faq-item__q"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {q}
        <span className="bp-faq-item__icon" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p className="bp-faq-item__a">{a}</p>}
    </div>
  );
}

export function BookingPanel({ restaurant, initialSlot }: { restaurant: Restaurant; initialSlot?: string }) {
  const { user } = useAuth();

  // Scroll to this panel when a slot was pre-selected from a card
  useEffect(() => {
    if (!initialSlot) return;
    const el = document.getElementById("prenota");
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [date, setDate] = useState(todayInputValue());
  const [selectedSlot, setSelectedSlot] = useState(
    (initialSlot && restaurant.slots.some((s) => s.time === initialSlot) ? initialSlot : null)
    ?? restaurant.slots[0]?.time
    ?? ""
  );
  const [guests, setGuests] = useState(2);
  const [availMsg, setAvailMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Recheck when params change
  useEffect(() => {
    if (!selectedSlot) return;
    setChecking(true);
    setAvailMsg(null);
    checkAvailability(restaurant.id, date, selectedSlot, guests)
      .then((r) => {
        if (!r.available) setAvailMsg(r.reason ?? "Non disponibile");
        else setAvailMsg(null);
      })
      .finally(() => setChecking(false));
  }, [date, selectedSlot, guests, restaurant.id]);

  const currentSlot = restaurant.slots.find((s) => s.time === selectedSlot);
  const href = `/booking?restaurant=${restaurant.slug}&date=${date}&time=${selectedSlot}&guests=${guests}`;

  return (
    <aside className="booking-panel" id="prenota" aria-label="Prenota un tavolo">
      {/* Header */}
      <div className="bp-header">
        <p className="eyebrow">Prenota il tavolo</p>
        <p className="bp-social-proof">{restaurant.socialProof}</p>
      </div>

      {/* Date */}
      <label className="bp-label">
        Data
        <input
          type="date"
          value={date}
          min={todayInputValue()}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {/* Time slots */}
      <div>
        <p className="bp-label-text">Orario</p>
        <div className="bp-slots">
          {restaurant.slots.map((slot) => {
            const urgent = slot.availableSeats <= 3;
            return (
              <button
                key={slot.id}
                type="button"
                className={`bp-slot${selectedSlot === slot.time ? " is-selected" : ""}${urgent ? " is-urgent" : ""}`}
                onClick={() => setSelectedSlot(slot.time)}
              >
                <strong>{slot.time}</strong>
                {slot.discount ? (
                  <span className="bp-slot__badge">-{slot.discount}%</span>
                ) : null}
                <small>{slot.availableSeats} post{slot.availableSeats === 1 ? "o" : "i"}</small>
              </button>
            );
          })}
        </div>
        {checking && <p className="bp-avail-msg">Verifico…</p>}
        {!checking && availMsg && (
          <p className="bp-avail-msg bp-avail-msg--error">⚠ {availMsg}</p>
        )}
      </div>

      {/* Guests stepper */}
      <div>
        <p className="bp-label-text">Persone</p>
        <div className="bp-guests">
          <button
            type="button"
            className="bp-guests__btn"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            aria-label="Riduci"
            disabled={guests <= 1}
          >
            −
          </button>
          <span className="bp-guests__count">
            {guests} {guests === 1 ? "persona" : "persone"}
          </span>
          <button
            type="button"
            className="bp-guests__btn"
            onClick={() => setGuests((g) => Math.min(10, g + 1))}
            aria-label="Aumenta"
            disabled={guests >= 10}
          >
            +
          </button>
        </div>
      </div>

      {/* Caparra (static mock — always "no deposit" for current data) */}
      <div className="bp-deposit">
        <span className="bp-deposit__icon">✓</span>
        <span>Nessuna caparra richiesta</span>
      </div>

      {/* Discount highlight */}
      {currentSlot?.discount ? (
        <div className="bp-offer">
          <strong>-{currentSlot.discount}% early bird</strong>
          <span>sconto applicato automaticamente</span>
        </div>
      ) : null}

      {/* CTA */}
      {user ? (
        <ClayLink
          href={availMsg ? "#" : href}
          className={`bp-cta${availMsg ? " is-disabled" : ""}`}
          onClick={availMsg ? (e) => e.preventDefault() : undefined}
        >
          Prenota il tavolo
        </ClayLink>
      ) : (
        <Link
          href={`/login?from=${encodeURIComponent(href)}`}
          className="clay-button clay-button--primary bp-cta"
        >
          Accedi per prenotare
        </Link>
      )}

      {/* Trust row */}
      <div className="bp-trust">
        <span>✓ Conferma immediata</span>
        <span>✓ Cancellazione gratuita</span>
      </div>

      {/* Policy */}
      <p className="bp-policy">
        Cancellazione gratuita fino a <strong>2 ore prima</strong> dell&apos;orario prenotato. Nessuna carta richiesta.
      </p>

      {/* FAQ */}
      <div className="bp-faq">
        {FAQ.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </aside>
  );
}
