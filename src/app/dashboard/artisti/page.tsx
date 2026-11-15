import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ApeJobs | Dashboard ApeHour",
};

export default function MerchantApeJobsPage() {
  return (
    <div className="dash-overview">
      <div className="dashboard-page-header">
        <p className="eyebrow">ApeJobs (in arrivo)</p>
        <h1>Trova personale per il tuo locale</h1>
        <p>ApeJobs ti permetterà di pubblicare annunci e trovare bartender, camerieri, DJ e animatori per le tue serate.</p>
      </div>

      <div className="dash-card bees-coming-soon">
        <span className="bees-coming-soon__icon">🧑‍🍳</span>
        <h2>Coming soon</h2>
        <p>Stiamo ancora definendo come funzionerà ApeJobs. Torna a trovarci presto!</p>
      </div>
    </div>
  );
}
