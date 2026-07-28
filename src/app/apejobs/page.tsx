import type { Metadata } from "next";
import { ClayLink } from "@/components/ui/clay-button";

export const metadata: Metadata = {
  title: "ApeJobs — ApeHour",
  description: "ApeJobs: cerca lavoro nei locali della tua città o trova subito il personale che ti serve.",
};

const ROLES = [
  { icon: "🍸", title: "Bartender" },
  { icon: "🧑‍🍳", title: "Cameriere/a" },
  { icon: "🎧", title: "DJ set" },
  { icon: "🎤", title: "Musicisti live" },
  { icon: "🎭", title: "Animazione & eventi" },
  { icon: "🧾", title: "Sala & accoglienza" },
  { icon: "👨‍🍳", title: "Chef & cucina" },
  { icon: "🛡️", title: "Sicurezza" },
  { icon: "🎀", title: "Hostess & steward" },
  { icon: "📱", title: "Social & grafica" },
];

const STEPS_VENUES = [
  { number: "01", title: "Pubblica l'offerta", body: "Descrivi la posizione, la data e il compenso in pochi minuti." },
  { number: "02", title: "Ricevi le candidature", body: "Le persone interessate si propongono con il loro profilo e CV." },
  { number: "03", title: "Scegli e assumi", body: "Scarica i CV, contatta chi vuoi e conferma direttamente in piattaforma." },
];

const STEPS_CANDIDATES = [
  { number: "01", title: "Crea il tuo account", body: "Attiva ApeJobs dal tuo profilo: posizione, città, CV e descrizione." },
  { number: "02", title: "Candidati alle offerte", body: "Sfoglia gli annunci pubblicati dai locali e proponiti in un tap." },
  { number: "03", title: "Lavora e fatti pagare", body: "Confermata l'offerta, il locale ti contatta per i dettagli e i pagamenti." },
];

export default function ApeJobsPage() {
  return (
    <div className="hiwp">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hiwp-hero">
        <div className="apejobs-scatter" aria-hidden="true">
          {ROLES.map((r, i) => (
            <div className={`apejobs-scatter-chip apejobs-scatter-chip--${i + 1}`} key={r.title}>
              <span className="apejobs-scatter-chip__icon">{r.icon}</span>
              <span>{r.title}</span>
            </div>
          ))}
        </div>

        <p className="eyebrow eyebrow--apejobs">ApeJobs</p>
        <h1>Cerca lavoro nei locali,<br />o trova subito chi ti serve</h1>
        <p className="hiwp-hero__sub">
          ApeJobs collega i locali che cercano personale — bartender, camerieri, DJ, animatori —
          con chi è in cerca della prossima occasione di lavoro.
        </p>
        <div className="hiwp-hero__actions">
          <ClayLink href="/register">Cerco Lavoro</ClayLink>
          <ClayLink href="/register?mode=locale" variant="secondary">Cerco Personale</ClayLink>
        </div>
      </section>

      {/* ── For candidates + venues, side by side ───────── */}
      <section className="hiwp-bars-section">
        <div className="hiwp-bars hiwp-bars--split">
          <div className="hiwp-bars__text">
            <p className="eyebrow">Cerco lavoro</p>
            <h2>Fatti assumere dai locali della tua città</h2>
            <p>
              Crea il tuo account, attiva ApeJobs dal profilo e candidati
              alle offerte pubblicate dai locali ApeHour.
            </p>
            <ul className="hiwp-bars__list">
              {STEPS_CANDIDATES.map((s) => (
                <li key={s.number}><strong>{s.title}.</strong> {s.body}</li>
              ))}
            </ul>
            <ClayLink href="/register" variant="secondary">
              Crea il tuo account
            </ClayLink>
          </div>

          <div className="hiwp-bars__text">
            <p className="eyebrow">Cerco personale</p>
            <h2>Trova la persona giusta per il tuo locale</h2>
            <p>
              Pubblica un'offerta in pochi minuti e ricevi le candidature
              di chi è disponibile nella tua città, senza intermediari.
            </p>
            <ul className="hiwp-bars__list">
              {STEPS_VENUES.map((s) => (
                <li key={s.number}><strong>{s.title}.</strong> {s.body}</li>
              ))}
            </ul>
            <ClayLink href="/register?mode=locale" variant="secondary">
              Pubblica un'offerta di lavoro
            </ClayLink>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="hiwp-cta-section">
        <p className="eyebrow">Inizia ora</p>
        <h2>Crea il tuo account e inizia subito</h2>
        <div className="hiwp-cta-actions">
          <ClayLink href="/register">Cerco lavoro</ClayLink>
          <ClayLink href="/register?mode=locale" variant="secondary">Cerco personale</ClayLink>
        </div>
      </section>

    </div>
  );
}
