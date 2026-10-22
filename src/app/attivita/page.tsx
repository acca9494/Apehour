import Link from "next/link";

export const metadata = { title: "Attività sostenibili | ApeHour" };

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
    </section>
  );
}
