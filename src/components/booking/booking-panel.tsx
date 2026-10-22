"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";
import { checkAvailability, getSlotsForDate } from "@/lib/bookings/service";
import type { Restaurant } from "@/lib/types";
import { todayInputValue } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";

type DaySlot = { time: string; availableSeats: number; totalSeats: number; discount?: number; label?: string };

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

export function BookingPanel({
  restaurant,
  initialSlot,
}: {
  restaurant: Restaurant;
  initialSlot?: string;
}) {
  const { user } = useAuth();
  const { t } = useLang();
  const b = t.booking;

  // Scroll to this panel when a slot was pre-selected from a card
  useEffect(() => {
    if (!initialSlot) return;
    const el = document.getElementById("prenota");
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [date, setDate] = useState(todayInputValue());
  const [slots, setSlots] = useState<DaySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(initialSlot ?? "");
  const [guests, setGuests] = useState(2);
  const [availMsg, setAvailMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Ricarica gli slot quando cambia la data — solo quelli del giorno scelto, non tutta la settimana.
  useEffect(() => {
    let cancelled = false;
    getSlotsForDate(restaurant.id, date).then((s) => {
      if (cancelled) return;
      setSlots(s);
      setSelectedSlot((prev) => (prev && s.some((x) => x.time === prev) ? prev : s[0]?.time ?? ""));
    });
    return () => { cancelled = true; };
  }, [restaurant.id, date]);

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

  const currentSlot = slots.find((s) => s.time === selectedSlot);
  const href = `/booking?restaurant=${restaurant.slug}&date=${date}&time=${selectedSlot}&guests=${guests}`;

  return (
    <aside className="booking-panel" id="prenota" aria-label={b.bookTable}>
      {/* Header */}
      <div className="bp-header">
        <p className="eyebrow">{b.bookTable}</p>
        <p className="bp-social-proof">{restaurant.socialProof}</p>
      </div>

      {/* Date */}
      <label className="bp-label">
        {b.date}
        <input
          type="date"
          value={date}
          min={todayInputValue()}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {/* Time slots */}
      <div>
        <p className="bp-label-text">{b.time}</p>
        <div className="bp-slots">
          {slots.map((slot) => {
            const urgent = slot.availableSeats <= 3;
            return (
              <button
                key={slot.time}
                type="button"
                className={`bp-slot${selectedSlot === slot.time ? " is-selected" : ""}${urgent ? " is-urgent" : ""}`}
                onClick={() => setSelectedSlot(slot.time)}
              >
                <strong>{slot.time}</strong>
                {slot.discount ? (
                  <span className="bp-slot__badge">-{slot.discount}%</span>
                ) : null}
                <small>{slot.availableSeats} {slot.availableSeats === 1 ? b.seat : b.seatsPlural}</small>
              </button>
            );
          })}
        </div>
        {checking && <p className="bp-avail-msg">{b.checking}</p>}
        {!checking && availMsg && (
          <p className="bp-avail-msg bp-avail-msg--error">⚠ {availMsg}</p>
        )}
      </div>

      {/* Guests stepper */}
      <div>
        <p className="bp-label-text">{b.people}</p>
        <div className="bp-guests">
          <button
            type="button"
            className="bp-guests__btn"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            aria-label={b.decrease}
            disabled={guests <= 1}
          >
            −
          </button>
          <span className="bp-guests__count">
            {guests} {guests === 1 ? b.person : b.peoplePlural}
          </span>
          <button
            type="button"
            className="bp-guests__btn"
            onClick={() => setGuests((g) => Math.min(10, g + 1))}
            aria-label={b.increase}
            disabled={guests >= 10}
          >
            +
          </button>
        </div>
      </div>

      {/* Caparra (static mock — always "no deposit" for current data) */}
      <div className="bp-deposit">
        <span className="bp-deposit__icon">✓</span>
        <span>{b.noDeposit}</span>
      </div>

      {/* Discount highlight */}
      {currentSlot?.discount ? (
        <div className="bp-offer">
          <strong>{b.earlyBird(currentSlot.discount)}</strong>
          <span>{b.autoApplied}</span>
        </div>
      ) : null}

      {/* CTA */}
      {user ? (
        <ClayLink
          href={availMsg ? "#" : href}
          className={`bp-cta${availMsg ? " is-disabled" : ""}`}
          onClick={availMsg ? (e) => e.preventDefault() : undefined}
        >
          {b.bookButton}
        </ClayLink>
      ) : (
        <Link
          href={`/login?from=${encodeURIComponent(href)}`}
          className="clay-button clay-button--primary bp-cta"
        >
          {b.loginToBook}
        </Link>
      )}

      {/* Trust row */}
      <div className="bp-trust">
        <span>{b.instantConfirm}</span>
        <span>{b.freeCancel}</span>
      </div>

      {/* Policy */}
      <p className="bp-policy">
        {b.policyParts[0]}<strong>{b.policyParts[1]}</strong>{b.policyParts[2]}
      </p>

      {/* FAQ */}
      <div className="bp-faq">
        {b.faq.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </aside>
  );
}
