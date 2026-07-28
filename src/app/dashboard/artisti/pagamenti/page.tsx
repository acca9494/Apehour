"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getArtistPayments, type ArtistPayment } from "@/lib/merchant/artist-payments";

export default function ApeJobsPagamentiMerchantPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<ArtistPayment[]>([]);

  useEffect(() => {
    if (!user) return;
    setPayments(getArtistPayments(user.id));
  }, [user]);

  if (!user) return null;

  const totalPaid = payments.filter((p) => p.status === "Pagato").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "In attesa").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="dash-overview">

      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">Pagamenti</p>
          <h1 className="dash-overview__title">Pagamenti effettuati agli artisti</h1>
        </div>
      </div>

      <div className="artist-payment-summary">
        <div className="artist-payment-summary__card">
          <span className="artist-payment-summary__label">Pagato</span>
          <span className="artist-payment-summary__value artist-payment-summary__value--gold">€{totalPaid}</span>
        </div>
        <div className="artist-payment-summary__card">
          <span className="artist-payment-summary__label">In attesa</span>
          <span className="artist-payment-summary__value">€{totalPending}</span>
        </div>
        <div className="artist-payment-summary__card">
          <span className="artist-payment-summary__label">Totale complessivo</span>
          <span className="artist-payment-summary__value">€{totalPaid + totalPending}</span>
        </div>
      </div>

      <div className="attivita-section">
        <div className="attivita-section__head">
          <h2>Storico pagamenti</h2>
          <span className="attivita-badge attivita-badge--muted">{payments.length} pagamenti</span>
        </div>
        {payments.length === 0 ? (
          <p className="events-page__empty">Nessun pagamento registrato finora.</p>
        ) : (
          <div className="attivita-table-card">
            <table className="attivita-table">
              <thead>
                <tr>
                  <th>Artista</th>
                  <th>Evento</th>
                  <th>Data</th>
                  <th>Importo</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td><span className="attivita-table__name">{p.artistName}</span></td>
                    <td className="attivita-table__muted">{p.eventTitle}</td>
                    <td className="attivita-table__muted">{p.date}</td>
                    <td><span className="attivita-table__donated">€{p.amount}</span></td>
                    <td>
                      <span className={`attivita-badge ${p.status === "Pagato" ? "attivita-badge--green" : "attivita-badge--muted"}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
