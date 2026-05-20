"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { saveVenueSettings } from "@/lib/merchant/store";
import type { AuthErrorCode } from "@/lib/auth/types";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Credenziali non valide.",
  email_taken: "Email già registrata. Prova ad accedere.",
  unknown: "Qualcosa è andato storto. Riprova.",
};

const CITIES = ["Milano", "Roma", "Firenze", "Torino", "Napoli", "Bologna", "Venezia", "Genova", "Palermo", "Bari", "Altra città"];
const PRICE_OPTIONS = ["< €15", "€15 – €25", "€25 – €40", "€40 – €60", "> €60"];
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

function CallCalendar({ venueName }: { venueName: string }) {
  const now = new Date();
  const [year, setYear]       = useState(now.getFullYear());
  const [month, setMonth]     = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booked, setBooked]   = useState(false);

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
          <br />Riceverai una email di conferma per <strong>{venueName}</strong>.
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
        <button
          type="button"
          className="mreg__btn mreg__btn--primary"
          onClick={() => setBooked(true)}
        >
          Conferma call — {selectedDay} {MONTHS[month]} · {selectedTime}
        </button>
      )}
    </div>
  );
}

export function MerchantRegisterForm() {
  const { register } = useAuth();

  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<AuthErrorCode | null>(null);

  const [s1, setS1] = useState<Step1>({ nome: "", cognome: "", email: "", telefono: "", password: "", privacy: false });
  const [s2, setS2] = useState<Step2>({ venueName: "", address: "", city: "", avgSpend: "" });

  function setF1<K extends keyof Step1>(k: K, v: Step1[K]) { setS1(p => ({ ...p, [k]: v })); }
  function setF2<K extends keyof Step2>(k: K, v: Step2[K]) { setS2(p => ({ ...p, [k]: v })); }

  function handleStep1(e: React.FormEvent) { e.preventDefault(); setStep(2); }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await register({
        name: `${s1.nome} ${s1.cognome}`.trim(),
        email: s1.email,
        password: s1.password,
        role: "commerciante",
      });
      saveVenueSettings({
        restaurantId: `rst-${session.user.id}`,
        name: s2.venueName,
        description: "",
        address: s2.address,
        city: s2.city || "Milano",
        phone: s1.telefono,
        email: s1.email,
        website: "",
        instagram: "",
        heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
        deposit: { required: false, amount: 5, perPerson: true, policy: "La caparra viene trattenuta in caso di no-show senza preavviso." },
      }, session.user.id);
      setStep(3);
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      setError(code as AuthErrorCode);
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
            <input type="password" value={s1.password} onChange={e => setF1("password", e.target.value)} placeholder="minimo 6 caratteri" required minLength={6} autoComplete="new-password" />
          </label>

          <label className="mreg__checkbox">
            <input type="checkbox" checked={s1.privacy} onChange={e => setF1("privacy", e.target.checked)} required />
            <span>Accetto l&apos;informativa sulla privacy di ApeHour</span>
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

      {step === 3 && <CallCalendar venueName={s2.venueName} />}
    </div>
  );
}
