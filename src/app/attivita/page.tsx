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
    <section className="page-section public-coming-soon">
      <span className="public-coming-soon__icon" aria-hidden="true">🌱</span>
      <h1>Attività sostenibili — in arrivo</h1>
      <p>
        Stiamo ancora definendo come funzioneranno le attività sostenibili su ApeHour.
        Torna a trovarci presto per scoprire le prime iniziative.
      </p>
      <Link href="/" className="clay-button clay-button--primary">Torna alla home</Link>

      <div className="activities-partners">
        <p className="activities-partners__label">In collaborazione con</p>
        <div className="activities-partners__grid">
          {PARTNERS.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="activities-partners__card">
              {p.image ? (
                <span className="activities-partners__photo">
                  <Image src={p.image} alt="" fill sizes="120px" />
                </span>
              ) : (
                <span className="activities-partners__icon" aria-hidden="true">{p.icon}</span>
              )}
              <strong>{p.name}</strong>
              <p>{p.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
