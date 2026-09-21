"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createRestaurant } from "@/lib/restaurants/service";
import { LegalModal } from "@/components/legal/legal-modal";
import type { PriceRange } from "@/lib/types";
import type { AuthErrorCode } from "@/lib/auth/types";

const ERROR_MESSAGES: Record<Exclude<AuthErrorCode, "email_confirmation_required">, string> = {
  invalid_credentials: "Credenziali non valide.",
  email_taken: "Email già registrata. Prova ad accedere.",
  unknown: "Qualcosa è andato storto. Riprova.",
};

const CITIES = ["Roma", "Ostia", "Fregene", "Ladispoli"];
const PRICE_OPTIONS = ["< €15", "€15 – €25", "€25 – €40", "€40 – €60", "> €60"];

function priceRangeFromAvgSpend(avgSpend: string): PriceRange {
  switch (avgSpend) {
    case "< €15":
    case "€15 – €25":
      return "$$";
    case "€25 – €40":
    case "€40 – €60":
      return "$$$";
    default:
      return "$$$$";
  }
}
const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const DAYS   = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

function getAvailableDays(year: number, month: number): Set<number> {
  const available = new Set<number>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) available.add(d);
  }
  return available;
}

type Step1 = { nome: string; cognome: string; email: string; telefono: string; password: string; privacy: boolean };
type Step2 = { venueName: string; address: string; city: string; avgSpend: string };

function Stepper({ step }: { step: number }) {
  return (
    <div className="mreg-stepper">
      <div className={`mreg-stepper__dot ${step >= 1 ? "is-active" : ""}`}>1</div>
      <div className={`mreg-stepper__line ${step >= 2 ? "is-active" : ""}`} />
      <div className={`mreg-stepper__dot ${step >= 2 ? "is-active" : ""}`}>2</div>
      <div className={`mreg-stepper__line ${step >= 3 ? "is-active" : ""}`} />
      <div className={`mreg-stepper__dot ${step >= 3 ? "is-active" : ""}`}>✓</div>
    </div>
  );
}

type CallDetails = {
  contactName: string;
  email: string;
  phone: string;
  venueName: string;
  address: string;
  city: string;
  avgSpend: string;
  eventSource?: string | null;
};

function CallCalendar({ details }: { details: CallDetails }) {
  const venueName = details.venueName;
  const now = new Date();
  const [year, setYear]       = useState(now.getFullYear());
  const [month, setMonth]     = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booked, setBooked]   = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  async function confirmCall() {
    if (!selectedDay || !selectedTime) return;
    setSending(true);
    setSendError(false);
    try {
      const slotDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
      const res = await fetch("/api/call-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, slotDate, slotTime: selectedTime }),
      });
      if (!res.ok) throw new Error("request failed");
      setBooked(true);
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  const available = getAvailableDays(year, month);
  const firstDow  = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null); setSelectedTime(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null); setSelectedTime(null);
  }

  if (booked) {
    return (
      <div className="mreg__booked">
        <p className="mreg__booked-icon">🗓️</p>
        <h3>Call confermata!</h3>
        <p>
          Ti aspettiamo il <strong>{selectedDay} {MONTHS[month]} {year}</strong> alle <strong>{selectedTime}</strong>.
          <br />Ti contatteremo per <strong>{venueName}</strong> al numero che ci hai lasciato.
        </p>
        <Link href="/dashboard" className="mreg__btn mreg__btn--primary" style={{ marginTop: "1rem", flex: "unset", width: "auto", padding: "0.65rem 1.75rem" }}>
          Vai alla dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className="mreg__calendar-wrap">
      <p className="mreg__step-label">3. Prenota una call</p>
      <p className="mreg__cal-sub">Scegli giorno e orario — ti contatteremo noi.</p>

      <div className="mreg-cal">
        <div className="mreg-cal__nav">
          <button type="button" onClick={prevMonth} className="mreg-cal__arrow">‹</button>
          <strong>{MONTHS[month]} {year}</strong>
          <button type="button" onClick={nextMonth} className="mreg-cal__arrow">›</button>
        </div>

        <div className="mreg-cal__grid">
          {DAYS.map(d => <span key={d} className="mreg-cal__dayname">{d}</span>)}
          {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const isAvail = available.has(d);
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                type="button"
                disabled={!isAvail}
                className={`mreg-cal__day ${isSelected ? "is-selected" : ""} ${!isAvail ? "is-disabled" : ""}`}
                onClick={() => { setSelectedDay(d); setSelectedTime(null); }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="mreg-times">
          <p className="mreg-times__label">Orario disponibile — {selectedDay} {MONTHS[month]}</p>
          <div className="mreg-times__grid">
            {TIMES.map(t => (
              <button
                key={t}
                type="button"
                className={`mreg-times__slot ${selectedTime === t ? "is-selected" : ""}`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDay && selectedTime && (
        <>
          {sendError && (
            <div className="auth-error" role="alert">
              Non siamo riusciti a registrare la richiesta. Riprova tra un attimo.
            </div>
          )}
          <button
            type="button"
            className="mreg__btn mreg__btn--primary"
            onClick={confirmCall}
            disabled={sending}
          >
            {sending ? "Invio…" : `Conferma call — ${selectedDay} ${MONTHS[month]} · ${selectedTime}`}
          </button>
        </>
      )}
    </div>
  );
}

export function MerchantRegisterForm({ eventSource, onAccountCreating }: { eventSource?: string | null; onAccountCreating?: () => void }) {
  const { login } = useAuth();

  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<Exclude<AuthErrorCode, "email_confirmation_required"> | null>(null);
  const [showLegal, setShowLegal] = useState(false);

  const [s1, setS1] = useState<Step1>({ nome: "", cognome: "", email: "", telefono: "", password: "", privacy: false });
  const [s2, setS2] = useState<Step2>({ venueName: "", address: "", city: "", avgSpend: "" });

  function setF1<K extends keyof Step1>(k: K, v: Step1[K]) { setS1(p => ({ ...p, [k]: v })); }
  function setF2<K extends keyof Step2>(k: K, v: Step2[K]) { setS2(p => ({ ...p, [k]: v })); }

  function handleStep1(e: React.FormEvent) { e.preventDefault(); setStep(2); }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const priceRange = priceRangeFromAvgSpend(s2.avgSpend);
    try {
      // I locali non richiedono conferma email: l'account nasce già confermato
      // (route server) e si entra subito, così si prosegue con la call.
      const res = await fetch("/api/merchant-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${s1.nome} ${s1.cognome}`.trim(),
          email: s1.email,
          password: s1.password,
          venueName: s2.venueName,
          venueAddress: s2.address,
          venueCity: s2.city || "Roma",
          venuePriceRange: priceRange,
          eventSource,
          privacyAccepted: s1.privacy,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error === "email_taken" ? "email_taken" : "unknown");
      }

      // Evita che la pagina di registrazione rimandi subito alla dashboard,
      // saltando lo step della call.
      onAccountCreating?.();
      await login({ email: s1.email, password: s1.password });

      const { data: { user } } = await createSupabaseBrowserClient().auth.getUser();
      if (user) {
        await createRestaurant({
          ownerId: user.id,
          name: s2.venueName,
          address: s2.address,
          city: s2.city || "Roma",
          priceRange,
          email: s1.email,
          phone: s1.telefono,
        }).catch(() => {});
      }
      setStep(3);
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      setError((code === "email_taken" ? "email_taken" : "unknown") as Exclude<AuthErrorCode, "email_confirmation_required">);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mreg">
      <Stepper step={step} />

      {step === 1 && (
        <form className="mreg__form" onSubmit={handleStep1}>
          <p className="mreg__step-label">1. Dettagli di contatto</p>

          <div className="mreg__row">
            <label className="mreg__field">
              <span>Nome <em>*</em></span>
              <input type="text" value={s1.nome} onChange={e => setF1("nome", e.target.value)} placeholder="Alessandro" required autoComplete="given-name" />
            </label>
            <label className="mreg__field">
              <span>Cognome <em>*</em></span>
              <input type="text" value={s1.cognome} onChange={e => setF1("cognome", e.target.value)} placeholder="Rossi" required autoComplete="family-name" />
            </label>
          </div>

          <label className="mreg__field">
            <span>Email <em>*</em></span>
            <input type="email" value={s1.email} onChange={e => setF1("email", e.target.value)} placeholder="la@tua-email.com" required autoComplete="email" />
          </label>

          <label className="mreg__field">
            <span>Telefono <em>*</em></span>
            <input type="tel" value={s1.telefono} onChange={e => setF1("telefono", e.target.value)} placeholder="+39 346 0000000" required autoComplete="tel" />
          </label>

          <label className="mreg__field">
            <span>Password <em>*</em></span>
            <input type="password" value={s1.password} onChange={e => setF1("password", e.target.value)} placeholder="minimo 8 caratteri" required minLength={8} autoComplete="new-password" />
          </label>

          <label className="mreg__checkbox">
            <input type="checkbox" checked={s1.privacy} onChange={e => setF1("privacy", e.target.checked)} required />
            <span>
              Accetto l&apos;{" "}
              <button type="button" className="mreg__privacy-link" onClick={() => setShowLegal(true)}>
                informativa sulla privacy
              </button>
              {" "}di ApeHour
            </span>
          </label>

          <button type="submit" className="mreg__btn mreg__btn--primary">Avanti</button>
        </form>
      )}

      {step === 2 && (
        <form className="mreg__form" onSubmit={handleStep2}>
          <p className="mreg__step-label">2. Dettagli del ristorante</p>

          {error && <div className="auth-error" role="alert">{ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown}</div>}

          <label className="mreg__field">
            <span>Come si chiama il tuo locale? <em>*</em></span>
            <input type="text" value={s2.venueName} onChange={e => setF2("venueName", e.target.value)} placeholder="Bar Bello, Spritz Milano…" required autoComplete="organization" />
          </label>

          <label className="mreg__field">
            <span>Indirizzo <em>*</em></span>
            <input type="text" value={s2.address} onChange={e => setF2("address", e.target.value)} placeholder="Via Roma 10, Milano" required autoComplete="street-address" />
          </label>

          <label className="mreg__field">
            <span>Città <em>*</em></span>
            <select value={s2.city} onChange={e => setF2("city", e.target.value)} required>
              <option value="" disabled>Seleziona…</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="mreg__field">
            <span>Conto medio per cliente <em>*</em></span>
            <select value={s2.avgSpend} onChange={e => setF2("avgSpend", e.target.value)} required>
              <option value="" disabled>Seleziona…</option>
              {PRICE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <div className="mreg__actions">
            <button type="button" className="mreg__btn mreg__btn--ghost" onClick={() => setStep(1)}>Indietro</button>
            <button type="submit" className="mreg__btn mreg__btn--primary" disabled={submitting}>
              {submitting ? "Invio…" : "Invia"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <CallCalendar
          details={{
            contactName: `${s1.nome} ${s1.cognome}`.trim(),
            email: s1.email,
            phone: s1.telefono,
            venueName: s2.venueName,
            address: s2.address,
            city: s2.city || "Roma",
            avgSpend: s2.avgSpend,
            eventSource,
          }}
        />
      )}

      <LegalModal open={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
}
