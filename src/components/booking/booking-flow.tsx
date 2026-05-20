"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ClayButton, ClayLink } from "@/components/ui/clay-button";
import { restaurants } from "@/lib/data/restaurants";
import { todayInputValue } from "@/lib/utils";
import {
  cancelBooking,
  checkAvailability,
  createBooking,
  getSlotsForDate,
} from "@/lib/bookings/service";
import type { AvailabilityResult, ClientBooking } from "@/lib/bookings/types";

// ── Step labels ───────────────────────────────────────────────────────────────
const STEPS = ["Quando", "Chi sei", "Conferma"] as const;
type Step = 0 | 1 | 2;

// ── Slot pill ─────────────────────────────────────────────────────────────────
function SlotPill({
  slot,
  selected,
  guests,
  onSelect,
}: {
  slot: { time: string; availableSeats: number; discount?: number; label?: string };
  selected: boolean;
  guests: number;
  onSelect: () => void;
}) {
  const tooFew = slot.availableSeats < guests;
  return (
    <button
      type="button"
      className={`booking-slot-pill${selected ? " is-selected" : ""}${tooFew ? " is-disabled" : ""}`}
      onClick={onSelect}
      disabled={tooFew}
      title={tooFew ? `Solo ${slot.availableSeats} posti` : undefined}
    >
      <strong>{slot.time}</strong>
      {slot.discount ? (
        <span className="slot-discount">-{slot.discount}%</span>
      ) : null}
      <small>
        {slot.availableSeats === 0
          ? "Esaurito"
          : `${slot.availableSeats} posti`}
      </small>
    </button>
  );
}

// ── Stepper header ────────────────────────────────────────────────────────────
function Stepper({ step }: { step: Step }) {
  return (
    <div className="booking3-stepper" aria-label="Passaggi prenotazione">
      {STEPS.map((label, i) => (
        <div
          key={label}
          className={`booking3-step${i === step ? " is-active" : i < step ? " is-done" : ""}`}
        >
          <span className="booking3-step__num">{i < step ? "✓" : i + 1}</span>
          <span className="booking3-step__label">{label}</span>
          {i < STEPS.length - 1 && <span className="booking3-step__line" />}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function BookingFlow() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const restaurantSlug = searchParams.get("restaurant") ?? restaurants[0].slug;
  const restaurant = restaurants.find((r) => r.slug === restaurantSlug) ?? restaurants[0];
  const modifyId = searchParams.get("modifyId") ?? null;

  // Step state
  const [step, setStep] = useState<Step>(0);

  // Step 1 — Quando e quanti
  const [date, setDate] = useState(searchParams.get("date") ?? todayInputValue());
  const [time, setTime] = useState(searchParams.get("time") ?? restaurant.slots[0]?.time ?? "");
  const [guests, setGuests] = useState(Number(searchParams.get("guests") ?? 2));
  const [slots, setSlots] = useState<Array<{ time: string; availableSeats: number; totalSeats: number; discount?: number; label?: string }>>(
    restaurant.slots.map((s) => ({
      time: s.time, availableSeats: s.availableSeats, totalSeats: s.availableSeats, discount: s.discount, label: s.label
    }))
  );
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

  // Reload slots when date changes
  useEffect(() => {
    getSlotsForDate(restaurant.id, date).then(setSlots);
  }, [date, restaurant.id]);

  // Recheck availability when time/guests/date changes
  useEffect(() => {
    if (!time) return;
    setAvailCheck(null);
    setCheckingAvail(true);
    checkAvailability(restaurant.id, date, time, guests)
      .then(setAvailCheck)
      .finally(() => setCheckingAvail(false));
  }, [restaurant.id, date, time, guests]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.time === time),
    [slots, time]
  );

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
    if (!user) { setBookingError("Devi essere loggato per prenotare."); return; }
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
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Errore durante la prenotazione");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Confirmed screen ────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="booking-confirmed">
        <div className="booking-confirmed__icon" aria-hidden="true">✓</div>
        <p className="eyebrow">Prenotazione confermata</p>
        <h1>{confirmed.restaurantName}</h1>
        <p className="booking-confirmed__ref">{confirmed.bookingRef}</p>
        <div className="booking-confirmed__details">
          <span>{confirmed.date.split("-").reverse().join("/")}</span>
          <span>·</span>
          <span>{confirmed.time}</span>
          <span>·</span>
          <span>{confirmed.guests} {confirmed.guests === 1 ? "persona" : "persone"}</span>
        </div>
        <p className="booking-confirmed__note">
          Conferma inviata a <strong>{confirmed.customerEmail}</strong>. Cancellazione gratuita fino a 2 ore prima.
        </p>
        <div className="booking-confirmed__actions">
          <ClayLink href="/profile">Le mie prenotazioni</ClayLink>
          <ClayLink href="/search" variant="secondary">Cerca altri locali</ClayLink>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <section className="booking-flow">
      <div className="booking-flow__intro">
        <p className="eyebrow">{modifyId ? "Modifica prenotazione" : "Prenota in 3 passi"}</p>
        <h1>{restaurant.name}</h1>
        <p>{restaurant.neighborhood} · {restaurant.city} · {restaurant.priceRange}</p>
        {modifyId && (
          <p className="booking-flow__modify-note">
            ℹ️ La prenotazione precedente verrà annullata automaticamente alla conferma.
          </p>
        )}
      </div>

      <Stepper step={step} />

      <div className="booking3-layout">
        {/* ── Step 1: Quando e quanti ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="booking-card booking-step">
            <h2>Quando e in quanti?</h2>

            <label>
              Data
              <input
                type="date"
                value={date}
                min={todayInputValue()}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div>
              <p className="booking-sublabel">Orario</p>
              <div className="booking3-slots">
                {slots.map((slot) => (
                  <SlotPill
                    key={slot.time}
                    slot={slot}
                    selected={time === slot.time}
                    guests={guests}
                    onSelect={() => setTime(slot.time)}
                  />
                ))}
              </div>
              {checkingAvail && <p className="booking-avail-msg">Verifico disponibilità…</p>}
              {!checkingAvail && availCheck && !availCheck.available && (
                <p className="booking-avail-msg booking-avail-msg--error">
                  {availCheck.reason}
                </p>
              )}
            </div>

            <label>
              Persone
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "persona" : "persone"}</option>
                ))}
              </select>
            </label>

            <ClayButton
              onClick={goToStep2}
              disabled={!availCheck?.available || checkingAvail}
              className="booking3-cta"
            >
              Continua →
            </ClayButton>
          </div>
        )}

        {/* ── Step 2: Chi sei ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="booking-card booking-step">
            <h2>I tuoi dati</h2>

            <label>
              Nome completo
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mario Rossi"
                required
                autoComplete="name"
              />
            </label>

            <label>
              Email
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
              Telefono <span style={{ color: "var(--white-25)", fontWeight: 400 }}>(facoltativo)</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 333 000 0000"
                autoComplete="tel"
              />
            </label>

            <label>
              Richieste speciali <span style={{ color: "var(--white-25)", fontWeight: 400 }}>(facoltativo)</span>
              <input
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Allergie, tavolo esterno, occasione speciale…"
              />
            </label>

            <div className="booking3-nav">
              <button type="button" className="booking3-back" onClick={() => setStep(0)}>
                ← Indietro
              </button>
              <ClayButton
                onClick={goToStep3}
                disabled={!name || !email}
                className="booking3-cta"
              >
                Vai al riepilogo →
              </ClayButton>
            </div>
          </div>
        )}

        {/* ── Step 3: Riepilogo + conferma ────────────────────────────────── */}
        {step === 2 && (
          <div className="booking-card booking-step">
            <h2>Riepilogo</h2>

            <div className="booking3-summary">
              <div className="booking3-summary__row">
                <span>Locale</span>
                <strong>{restaurant.name}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>Data</span>
                <strong>{date.split("-").reverse().join("/")}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>Orario</span>
                <strong>{time}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>Persone</span>
                <strong>{guests}</strong>
              </div>
              {selectedSlot?.discount ? (
                <div className="booking3-summary__row booking3-summary__row--highlight">
                  <span>Sconto applicato</span>
                  <strong>-{selectedSlot.discount}%</strong>
                </div>
              ) : null}
              <div className="booking3-summary__row">
                <span>Nome</span>
                <strong>{name}</strong>
              </div>
              <div className="booking3-summary__row">
                <span>Email</span>
                <strong>{email}</strong>
              </div>
              {phone && (
                <div className="booking3-summary__row">
                  <span>Telefono</span>
                  <strong>{phone}</strong>
                </div>
              )}
            </div>

            <p className="booking3-terms">
              Cancellazione gratuita fino a 2 ore prima. Nessuna carta richiesta.
            </p>

            {bookingError && (
              <div className="auth-error" role="alert">{bookingError}</div>
            )}

            {!user && (
              <div className="auth-error" role="alert">
                <ClayLink href={`/login?from=/booking?restaurant=${restaurantSlug}`} variant="ghost">
                  Accedi per confermare →
                </ClayLink>
              </div>
            )}

            <div className="booking3-nav">
              <button type="button" className="booking3-back" onClick={() => setStep(1)}>
                ← Indietro
              </button>
              <ClayButton
                onClick={handleConfirm}
                disabled={submitting || !user}
                className="booking3-cta"
              >
                {submitting ? "Confermando…" : "Conferma prenotazione"}
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
            <div><dt>Data</dt><dd>{date.split("-").reverse().join("/")}</dd></div>
            <div><dt>Orario</dt><dd>{time || "—"}</dd></div>
            <div><dt>Persone</dt><dd>{guests}</dd></div>
            {selectedSlot?.discount && (
              <div><dt>Offerta</dt><dd>-{selectedSlot.discount}% early bird</dd></div>
            )}
          </dl>
          {restaurant.urgencyLabel && (
            <p className="trust-label" style={{ marginTop: "0.75rem" }}>
              ⚡ {restaurant.urgencyLabel}
            </p>
          )}
          <p className="booking-panel__note" style={{ marginTop: "0.5rem" }}>
            Conferma immediata · Cancellazione gratuita
          </p>
        </aside>
      </div>
    </section>
  );
}
