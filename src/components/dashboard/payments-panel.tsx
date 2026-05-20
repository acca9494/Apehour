"use client";

import { useEffect, useState } from "react";
import { fetchMerchantBookings } from "@/lib/bookings/service";
import type { MerchantBookingView } from "@/lib/bookings/types";

const MERCHANT_RESTAURANT_IDS = ["rst-001"];

type PaymentStatus = "paid" | "unpaid" | "refunded";

interface PaymentRow {
  bookingId: string;
  bookingRef: string;
  customerName: string;
  date: string;
  time: string;
  guests: number;
  bookingStatus: string;
  depositRequired: boolean;
  depositAmount: number;
  depositPaid: boolean;
  paymentStatus: PaymentStatus;
}

function derivePaymentStatus(b: MerchantBookingView): PaymentStatus {
  if (b.status === "cancelled") return "refunded";
  if (b.depositPaid) return "paid";
  return "unpaid";
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: "Pagata",
  unpaid: "Non pagata",
  refunded: "Rimborsata",
};

const FILTER_TABS: { key: "all" | PaymentStatus; label: string }[] = [
  { key: "all", label: "Tutte" },
  { key: "paid", label: "Pagate" },
  { key: "unpaid", label: "Non pagate" },
  { key: "refunded", label: "Rimborsate" },
];

export function PaymentsPanel() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | PaymentStatus>("all");

  useEffect(() => {
    fetchMerchantBookings(MERCHANT_RESTAURANT_IDS).then((bookings) => {
      const mapped: PaymentRow[] = bookings.map((b) => ({
        bookingId: b.id,
        bookingRef: b.bookingRef,
        customerName: b.customerName,
        date: b.date,
        time: b.time,
        guests: b.guests,
        bookingStatus: b.status,
        depositRequired: b.depositRequired,
        depositAmount: b.depositAmount ?? 0,
        depositPaid: b.depositPaid,
        paymentStatus: derivePaymentStatus(b),
      }));
      setRows(mapped);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? rows : rows.filter((r) => r.paymentStatus === filter);

  const totalPaid = rows.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + r.depositAmount, 0);
  const totalPending = rows.filter((r) => r.paymentStatus === "unpaid" && r.depositRequired).reduce((s, r) => s + r.depositAmount, 0);
  const totalRefunded = rows.filter((r) => r.paymentStatus === "refunded").reduce((s, r) => s + r.depositAmount, 0);

  if (loading) return <div className="dash-loading">Caricamento pagamenti…</div>;

  return (
    <div className="payments-panel">
      <div className="dashboard-page-header">
        <p className="eyebrow">Pagamenti</p>
        <h1>Caparre e pagamenti</h1>
        <p>Riepilogo delle caparre ricevute e dei pagamenti legati alle prenotazioni.</p>
      </div>

      {/* Summary cards */}
      <div className="dash-stat-grid">
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Caparre ricevute</span>
          <span className="dash-stat-card__value dash-stat-card__value--yellow">€{totalPaid.toFixed(2)}</span>
          <span className="dash-stat-card__trend">{rows.filter((r) => r.paymentStatus === "paid").length} transazioni</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">In attesa</span>
          <span className="dash-stat-card__value">€{totalPending.toFixed(2)}</span>
          <span className="dash-stat-card__trend">{rows.filter((r) => r.paymentStatus === "unpaid" && r.depositRequired).length} caparre richieste</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Rimborsate</span>
          <span className="dash-stat-card__value">€{totalRefunded.toFixed(2)}</span>
          <span className="dash-stat-card__trend">{rows.filter((r) => r.paymentStatus === "refunded").length} rimborsi</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Stripe</span>
          <span className="dash-stat-card__value" style={{ fontSize: "1rem", marginTop: "0.5rem" }}>Non collegato</span>
          <span className="dash-stat-card__trend">
            <a href="#stripe-setup" style={{ color: "var(--yellow)" }}>Configura Stripe →</a>
          </span>
        </div>
      </div>

      {/* Stripe setup notice */}
      <div className="dash-table-card payments-stripe-notice" id="stripe-setup">
        <div className="payments-stripe-notice__icon">💳</div>
        <div>
          <strong>Collega Stripe per accettare pagamenti online</strong>
          <p>
            Le caparre vengono addebitate automaticamente tramite Stripe Checkout.
            La configurazione richiede una chiave API Stripe e la configurazione dei webhook.
          </p>
          <div className="payments-stripe-notice__steps">
            <div className="payments-step">
              <span className="payments-step__num">1</span>
              <span>Crea un account su <strong>stripe.com</strong></span>
            </div>
            <div className="payments-step">
              <span className="payments-step__num">2</span>
              <span>Aggiungi <code>STRIPE_SECRET_KEY</code> e <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> nel file <code>.env.local</code></span>
            </div>
            <div className="payments-step">
              <span className="payments-step__num">3</span>
              <span>Configura il webhook Stripe verso <code>/api/webhooks/stripe</code></span>
            </div>
            <div className="payments-step">
              <span className="payments-step__num">4</span>
              <span>Attiva la caparra nelle <strong>Impostazioni locale</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mbk-tabs" style={{ marginBottom: "1rem" }}>
        {FILTER_TABS.map((t) => {
          const count = t.key === "all" ? rows.length : rows.filter((r) => r.paymentStatus === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              className={`mbk-tab${filter === t.key ? " is-active" : ""}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              <span className="mbk-tab__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="dash-table-card">
        {filtered.length === 0 ? (
          <p className="dash-empty">Nessun pagamento trovato per questo filtro.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Rif.</th>
                <th>Cliente</th>
                <th>Data · Ora</th>
                <th>Ospiti</th>
                <th>Caparra</th>
                <th>Stato pagamento</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.bookingId}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--white-50)" }}>
                    {row.bookingRef}
                  </td>
                  <td>{row.customerName}</td>
                  <td>{row.date} · {row.time}</td>
                  <td>{row.guests}</td>
                  <td>
                    {row.depositRequired
                      ? <strong style={{ color: "var(--yellow)" }}>€{row.depositAmount.toFixed(2)}</strong>
                      : <span style={{ color: "var(--white-50)" }}>—</span>}
                  </td>
                  <td>
                    <span className={`pay-badge pay-badge--${row.paymentStatus}`}>
                      {STATUS_LABEL[row.paymentStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
