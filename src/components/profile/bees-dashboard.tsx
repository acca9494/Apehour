export function BeesDashboard() {
  return (
    <div className="bees-page">
      <div className="dashboard-page-header">
        <p className="eyebrow">BEES</p>
        <h1>Il tuo portafoglio BEES</h1>
        <p>Guadagna punti ad ogni prenotazione e scala i livelli.</p>
      </div>

      <div className="dash-card bees-coming-soon">
        <span className="bees-coming-soon__icon">🐝</span>
        <h2>Coming soon</h2>
        <p>Stiamo ancora definendo come funzionerà il programma BEES. Torna a trovarci presto!</p>
      </div>
    </div>
  );
}
