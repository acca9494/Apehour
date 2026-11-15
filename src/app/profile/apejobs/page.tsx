import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ApeJobs | ApeHour",
};

export default function ProfileApeJobsPage() {
  return (
    <div className="dash-overview">
      <div className="dashboard-page-header">
        <p className="eyebrow">ApeJobs (in arrivo)</p>
        <h1>Cerca lavoro nei locali</h1>
        <p>ApeJobs collega i locali che cercano personale — bartender, camerieri, DJ, animatori — con chi è in cerca della prossima occasione di lavoro.</p>
      </div>

      <div className="dash-card bees-coming-soon">
        <span className="bees-coming-soon__icon">🧑‍🍳</span>
        <h2>Coming soon</h2>
        <p>Stiamo ancora definendo come funzionerà ApeJobs. Torna a trovarci presto!</p>
      </div>
    </div>
  );
}
