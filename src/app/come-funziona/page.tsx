import type { Metadata } from "next";
import Link from "next/link";
import { ClayLink } from "@/components/ui/clay-button";

export const metadata: Metadata = {
  title: "Come funziona — ApeHour",
  description: "Scopri come prenotare il tuo aperitivo con ApeHour in tre semplici passi.",
};

const STEPS = [
  {
    number: "01",
    icon: "🔍",
    title: "Cerca il locale",
    body: "Inserisci la città, l'orario e quante persone siete. Vedi subito quali bar hanno disponibilità e le offerte attive per quella fascia oraria.",
  },
  {
    number: "02",
    icon: "🍹",
    title: "Scegli e prenota",
    body: "Sfoglia i locali selezionati, leggi le recensioni verificate e prenota il tavolo in pochi tap. Niente telefonate, niente attesa.",
  },
  {
    number: "03",
    icon: "✅",
    title: "Conferma istantanea",
    body: "Ricevi la conferma immediata via email o notifica. Il locale sa già chi sei — presentati e goditi l'aperitivo.",
  },
];

const FAQS = [
  {
    q: "È gratuito prenotare?",
    a: "Sì, prenotare su ApeHour è completamente gratuito per i clienti. Paghi direttamente al locale al momento dell'aperitivo.",
  },
  {
    q: "Posso cancellare la prenotazione?",
    a: "Sì, puoi cancellare fino a 2 ore prima dell'orario prenotato direttamente dal tuo profilo, senza penali.",
  },
  {
    q: "I locali sono verificati?",
    a: "Tutti i bar su ApeHour sono approvati manualmente dal nostro team. Verifichiamo qualità, disponibilità reale e rispetto degli orari.",
  },
  {
    q: "Come funziona per i locali?",
    a: "I bar si registrano gratuitamente, impostano la disponibilità dei tavoli e le offerte happy hour. Ricevono le prenotazioni in tempo reale.",
  },
];

const STATS = [
  { value: "4.8★", label: "Rating medio" },
  { value: "1 min", label: "Per prenotare" },
  { value: "100%", label: "Conferma istantanea" },
  { value: "0€", label: "Commissioni cliente" },
];

export default function ComeFunzionaPage() {
  return (
    <div className="hiwp">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hiwp-hero">
        <p className="eyebrow">Come funziona</p>
        <h1>Aperitivo prenotato in&nbsp;meno di un minuto</h1>
        <p className="hiwp-hero__sub">
          Nessuna telefonata, nessuna attesa. Trova il bar, scegli il tavolo,
          ricevi la conferma — tutto dal tuo telefono.
        </p>
        <div className="hiwp-hero__actions">
          <ClayLink href="/search">Cerca un locale</ClayLink>
          <Link className="hiwp-hero__link" href="/register">Registrati gratis</Link>
        </div>
      </section>

      {/* ── Steps ─────────────────────────────────────── */}
      <section className="hiwp-steps-section">
        <div className="hiwp-steps">
          {STEPS.map((step) => (
            <div className="hiwp-step" key={step.number}>
              <div className="hiwp-step__num">{step.number}</div>
              <div className="hiwp-step__icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="hiwp-stats-section">
        <div className="hiwp-stats">
          {STATS.map((s) => (
            <div className="hiwp-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── For bars ──────────────────────────────────── */}
      <section className="hiwp-bars-section">
        <div className="hiwp-bars">
          <div className="hiwp-bars__text">
            <p className="eyebrow">Sei un locale?</p>
            <h2>Riempi i tavoli nelle ore di punta</h2>
            <p>
              Registra il tuo bar gratuitamente, imposta la disponibilità e
              gestisci le prenotazioni in tempo reale. Nessuna commissione
              nascosta, nessun contratto.
            </p>
            <ul className="hiwp-bars__list">
              <li>Visibilità garantita nelle ricerche</li>
              <li>Dashboard prenotazioni in tempo reale</li>
              <li>Offerte happy hour personalizzate</li>
              <li>Recensioni verificate dai clienti</li>
            </ul>
            <ClayLink href="/#per-i-locali" variant="secondary">
              Registra il tuo bar
            </ClayLink>
          </div>
          <div className="hiwp-bars__visual">
            <div className="hiwp-bars__card">
              <p className="eyebrow">Prenotazione ricevuta</p>
              <div className="hiwp-bars__booking">
                <div className="hiwp-bars__booking-row">
                  <span>Tavolo</span><strong>2 persone · 19:30</strong>
                </div>
                <div className="hiwp-bars__booking-row">
                  <span>Offerta</span><strong>Spritz + stuzzichini -20%</strong>
                </div>
                <div className="hiwp-bars__booking-row">
                  <span>Stato</span>
                  <strong className="hiwp-bars__status">Confermata ✓</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="hiwp-faq-section">
        <div className="hiwp-faq-inner">
          <p className="eyebrow">FAQ</p>
          <h2>Domande frequenti</h2>
          <div className="hiwp-faq-list">
            {FAQS.map((faq) => (
              <div className="hiwp-faq-item" key={faq.q}>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="hiwp-cta-section">
        <p className="eyebrow">Inizia ora</p>
        <h2>Il tuo prossimo aperitivo è a un tap di distanza</h2>
        <div className="hiwp-cta-actions">
          <ClayLink href="/search">Cerca un locale</ClayLink>
          <ClayLink href="/register" variant="secondary">Crea account gratis</ClayLink>
        </div>
      </section>

    </div>
  );
}
