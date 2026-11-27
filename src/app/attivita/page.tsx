import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Attività sostenibili | ApeHour" };

const PARTNERS = [
  {
    name: "Sotto al Mare",
    image: "/sotto-al-mare.png",
    description: "Associazione che si occupa di tutela dei delfini costieri e monitoraggio del mare lungo il litorale del Lazio.",
    url: "https://sottoalmare.it/",
  },
  {
    name: "Arnia ETS",
    image: "/arnia-ets.png",
    description: "Associazione dedicata alla tutela delle api e alla sensibilizzazione ambientale.",
    url: "https://www.arniaets.it/",
  },
];

export default function AttivitaPage() {
  return (
    <>
      <section className="page-section public-coming-soon">
        <span className="public-coming-soon__icon" aria-hidden="true">🌱</span>
        <h1>Attività sostenibili — in arrivo</h1>
        <p>
          Stiamo ancora definendo come funzioneranno le attività sostenibili su ApeHour.
          Torna a trovarci presto per scoprire le prime iniziative.
        </p>
        <Link href="/" className="clay-button clay-button--primary">Torna alla home</Link>
      </section>

      <section className="page-section activities-partners">
        <p className="activities-partners__label">In collaborazione con</p>
        <div className="activities-partners__grid">
          {PARTNERS.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="activities-partners__card">
              <span className="activities-partners__photo">
                <span className="activities-partners__splash" aria-hidden="true" />
                <span className="activities-partners__photo-inner">
                  <Image src={p.image} alt="" fill sizes="(max-width: 600px) 90vw, 320px" style={{ objectFit: "contain" }} />
                </span>
              </span>
              <span className="activities-partners__body">
                <strong>{p.name}</strong>
                <p>{p.description}</p>
              </span>
              <span className="activities-partners__cta">
                <span className="activities-partners__cta-text">Vai al sito</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
