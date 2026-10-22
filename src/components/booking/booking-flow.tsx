"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton, ClayLink } from "@/components/ui/clay-button";
import { getRestaurantBySlugClient } from "@/lib/services/restaurants.client";
import type { Restaurant } from "@/lib/types";
import { todayInputValue } from "@/lib/utils";
import {
  cancelBooking,
  checkAvailability,
  createBooking,
  getSlotsForDate,
} from "@/lib/bookings/service";
import type { AvailabilityResult, ClientBooking } from "@/lib/bookings/types";
import { useLang } from "@/lib/i18n/context";

type Step = 0 | 1 | 2;

// ── Slot pill ─────────────────────────────────────────────────────────────────
function SlotPill({
  slot,
  selected,
  guests,
  onSelect,
  c,
}: {
  slot: { time: string; availableSeats: number; discount?: number; label?: string };
  selected: boolean;
  guests: number;
  onSelect: () => void;
  c: ReturnType<typeof useLang>["t"]["checkout"];
}) {
  const tooFew = slot.availableSeats < guests;
  return (
    <button
      type="button"
      className={`booking-slot-pill${selected ? " is-selected" : ""}${tooFew ? " is-disabled" : ""}`}
      onClick={onSelect}
      disabled={tooFew}
      title={tooFew ? c.onlySeats(slot.availableSeats) : undefined}
    >
      <strong>{slot.time}</strong>
      {slot.discount ? (
        <span className="slot-discount">-{slot.discount}%</span>
      ) : null}
      <small>
        {slot.availableSeats === 0
          ? c.soldOut
          : c.seatsLeft(slot.availableSeats)}
      </small>
    </button>
  );
}

// ── Stepper header ────────────────────────────────────────────────────────────
function Stepper({ step, c }: { step: Step; c: ReturnType<typeof useLang>["t"]["checkout"] }) {
  return (
    <div className="booking3-stepper" aria-label={c.stepsAria}>
      {c.steps.map((label, i) => (
        <div
          key={label}
          className={`booking3-step${i === step ? " is-active" : i < step ? " is-done" : ""}`}
        >
          <span className="booking3-step__num">{i < step ? "✓" : i + 1}</span>
          <span className="booking3-step__label">{label}</span>
          {i < c.steps.length - 1 && <span className="booking3-step__line" />}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function BookingFlow() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useLang();
  const c = t.checkout;

  const restaurantSlug = searchParams.get("restaurant");
  const modifyId = searchParams.get("modifyId") ?? null;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  // Step state
  const [step, setStep] = useState<Step>(0);

  // Step 1 — Quando e quanti
  const [date, setDate] = useState(searchParams.get("date") ?? todayInputValue());
  const [time, setTime] = useState(searchParams.get("time") ?? "");
  const [slots, setSlots] = useState<Array<{ time: string; availableSeats: number; totalSeats: number; discount?: number; label?: string }>>([]);
  const [guests, setGuests] = useState(Number(searchParams.get("guests") ?? 2));
  const [availCheck, setAvailCheck] = useState<AvailabilityResult | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  // Step 2 — Chi sei
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Step 3 — Confirm / Result
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ClientBooking | null>(null);

  // Pre-fill from auth when user loads
  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name);
      setEmail((prev) => prev || user.email);
    }
  }, [user]);

  // Carica il locale dallo slug in query string
  useEffect(() => {
    if (!restaurantSlug) { setLoadingRestaurant(false); return; }
    let cancelled = false;
    setLoadingRestaurant(true);
    getRestaurantBySlugClient(restaurantSlug).then((r) => {
      if (cancelled) return;
      setRestaurant(r);
      setLoadingRestaurant(false);
    });
    return () => { cancelled = true; };
  }, [restaurantSlug]);

  // Reload slots when date changes
  useEffect(() => {
    if (!restaurant) return;
    getSlotsForDate(restaurant.id, date).then(setSlots);
  }, [date, restaurant]);

  // Recheck availability when time/guests/date changes
  useEffect(() => {
    if (!restaurant || !time) return;
    setAvailCheck(null);
    setCheckingAvail(true);
    checkAvailability(restaurant.id, date, time, guests)
      .then(setAvailCheck)
      .finally(() => setCheckingAvail(false));
  }, [restaurant, date, time, guests]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.time === time),
    [slots, time]
  );

  if (loadingRestaurant) return null;

  if (!restaurant) {
    return (
      <div className="booking-confirmed">
        <p className="eyebrow">{c.venueNotFound}</p>
        <h1>{c.notFoundTitle}</h1>
        <p className="booking-confirmed__note">{c.notFoundNote}</p>
        <div className="booking-confirmed__actions">
          <ClayLink href="/search">{c.findVenues}</ClayLink>
        </div>
      </div>
    );
  }

  // ── Step transitions ────────────────────────────────────────────────────────
  function goToStep2() {
    if (!availCheck?.available) return;
    setStep(1);
  }

  function goToStep3() {
    if (!name || !email) return;
    setBookingError(null);
    setStep(2);
  }

  async function handleConfirm() {
    if (!user) { setBookingError(c.loginRequired); return; }
    if (!restaurant) return;
    setSubmitting(true);
    setBookingError(null);
    try {
      if (modifyId) {
        await cancelBooking(modifyId, user.id, "Modificata dal cliente");
      }
      const result = await createBooking(
        {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          restaurantCity: restaurant.city,
          date,
          time,
          guests,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          specialRequests: specialRequests || undefined,
        },
        user.id
      );
      setConfirmed(result);
      fetch("/api/booking-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: result.id, kind: "confirmed" }),
      }).catch(() => {});
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : c.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Confirmed screen ────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="booking-confirmed">
        <div className="booking-confirmed__icon" aria-hidden="true">✓</div>
        <p className="eyebrow">{c.confirmedTitle}</p>
        <h1>{confirmed.restaurantName}</h1>
        <p className="booking-confirmed__ref">{confirmed.bookingRef}</p>
        <div className="booking-confirmed__details">
          <span>{confirmed.date.split("-").reverse().join("/")}</span>
          <span>·</span>
          <span>{confirmed.time}</span>
          <span>·</span>
          <span>{confirmed.guests} {confirmed.guests === 1 ? c.person : c.peoplePlural}</span>
        </div>
        <p className="booking-confirmed__note">
          {c.confirmedSentTo} <strong>{confirmed.customerEmail}</strong>. {c.confirmedCancelNote}
        </p>
        <div className="booking-confirmed__actions">
          <ClayLink href="/profile">{c.myBookings}</ClayLink>
          <ClayLink href="/search" variant="secondary">{c.findOtherVenues}</ClayLink>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <section className="booking-flow">
      <div className="booking-flow__intro">
        <p className="eyebrow">{modifyId ? c.modifyBooking : c.bookIn3Steps}</p>
        <h1>{restaurant.name}</h1>
        <p>{restaurant.neighborhood} · {restaurant.city} · {restaurant.priceRange}</p>
        {modifyId && (
          <p className="booking-flow__modify-note">
            {c.modifyNote}
          </p>
        )}
      </div>

      <Stepper step={step} c={c} />

      <div className="booking3-layout">
        {/* ── Step 1: Quando e quanti ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="booking-card booking-step">
            <h2>{c.step1Title}</h2>

            <label>
              {c.date}
              <input
                type="date"
                value={date}
                min={todayInputValue()}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div>
              <p className="booking-sublabel">{c.time}</p>
              <div className="booking3-slots">
                {slots.map((slot) => (
                  <SlotPill
                    key={slot.time}
                    slot={slot}
                    selected={time === slot.time}
                    guests={guests}
                    onSelect={() => setTime(slot.time)}
                    c={c}
                  />
                ))}
              </div>
              {checkingAvail && <p className="booking-avail-msg">{c.checkingAvail}</p>}
              {!checkingAvail && availCheck && !availCheck.available && (
                <p className="booking-avail-msg booking-avail-msg--error">
                  {availCheck.reason}
                </p>
              )}
            </div>

            <label>
              {c.people}
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? c.person : c.peoplePlural}</option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
              <ClayButton
                onClick={goToStep2}
                disabled={!availCheck?.available || checkingAvail}
                className="booking3-cta"
              >
                {c.continue}
              </ClayButton>
            </div>
          </div>
        )}

        {/* ── Step 2: Chi sei ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="booking-card booking-step">
            <h2>{c.step2Title}</h2>

            <label>
              {c.fullName}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mario Rossi"
                required
                autoComplete="name"
              />
            </label>

            <label>
              {c.email}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario@email.com"
                required
                autoComplete="email"
              />
            </label>

            <label>
              {c.phone} <span style={{ color: "var(--white-25)", fontWeight: 400 }}>{c.optional}</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 333 000 0000"
                autoComplete="tel"
              />
            </label>

            <label>
              {c.specialRequests} <span style={{ color: "var(--white-25)", fontWeight: 400 }}>{c.optional}</span>
              <input
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={c.specialRequestsPlaceholder}
              />
            </label>

            <div className="booking3-nav">
              <button type="button" className="booking3-back" onClick={() => setStep(0)}>
                {c.back}
              </button>
              <ClayButton
                onClick={goToStep3}
                disabled={!name || !email}
                className="booking3-cta"
              >
                {c.goToSummary}
              </ClayButton>
            </div>
          </div>
        )}

        {/* ── Step 3: Riepilogo + conferma ────────────────────────────────── */}
        {step === 2 && (
          <div className="booking-card booking-step">
            <h2>{c.step3Title}</h2>

            <div className="booking3-summary">
              <div className="booking3-summary__row">
                <span>{c.venue}</span>
                <strong>{restaurant.name}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>{c.date}</span>
                <strong>{date.split("-").reverse().join("/")}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>{c.time}</span>
                <strong>{time}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>{c.people}</span>
                <strong>{guests}</strong>
              </div>
              {selectedSlot?.discount ? (
                <div className="booking3-summary__row booking3-summary__row--highlight">
                  <span>{c.discountApplied}</span>
                  <strong>-{selectedSlot.discount}%</strong>
                </div>
              ) : null}
              <div className="booking3-summary__row">
                <span>{c.name}</span>
                <strong>{name}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>{c.email}</span>
                <strong>{email}</strong>
              </div>
              {phone && (
                <div className="booking3-summary__row">
                  <span>{c.phone}</span>
                  <strong>{phone}</strong>
                </div>
              )}
            </div>

            <p className="booking3-terms">
              {c.termsNote}
            </p>

            {bookingError && (
              <div className="auth-error" role="alert">{bookingError}</div>
            )}

            {!user && (
              <div className="auth-error" role="alert">
                <ClayLink href={`/login?from=/booking?restaurant=${restaurantSlug}`} variant="ghost">
                  {c.loginToConfirm}
                </ClayLink>
              </div>
            )}

            <div className="booking3-nav">
              <button type="button" className="booking3-back" onClick={() => setStep(1)}>
                {c.back}
              </button>
              <ClayButton
                onClick={handleConfirm}
                disabled={submitting || !user}
                className="booking3-cta"
              >
                {submitting ? c.confirming : c.confirmBooking}
              </ClayButton>
            </div>
          </div>
        )}

        {/* ── Sidebar riepilogo ────────────────────────────────────────────── */}
        <aside className="checkout-summary">
          <p className="eyebrow">{restaurant.cuisine}</p>
          <h2>{restaurant.name}</h2>
          <p style={{ color: "var(--white-50)", fontSize: "0.86rem", margin: "0 0 1rem" }}>
            {restaurant.neighborhood} · {restaurant.city}
          </p>
          <dl>
            <div><dt>{c.date}</dt><dd>{date.split("-").reverse().join("/")}</dd></div>
            <div><dt>{c.time}</dt><dd>{time || "—"}</dd></div>
            <div><dt>{c.people}</dt><dd>{guests}</dd></div>
            {selectedSlot?.discount && (
              <div><dt>{c.offer}</dt><dd>{c.earlyBird(selectedSlot.discount)}</dd></div>
            )}
          </dl>
          {restaurant.urgencyLabel && (
            <p className="trust-label" style={{ marginTop: "0.75rem" }}>
              ⚡ {restaurant.urgencyLabel}
            </p>
          )}
          <p className="booking-panel__note" style={{ marginTop: "0.5rem" }}>
            {c.instantAndFree}
          </p>
        </aside>
      </div>
    </section>
  );
}
