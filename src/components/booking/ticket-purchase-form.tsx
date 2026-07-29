"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ClayLink } from "@/components/ui/clay-button";
import { purchaseTicket, parsePrice } from "@/lib/tickets/service";
import { downloadTicket } from "@/lib/tickets/download";
import type { EventTicket } from "@/lib/tickets/types";
import type { EventItem } from "@/lib/data/events";

export function TicketPurchaseForm({ event }: { event: EventItem }) {
  const { user } = useAuth();
  const { unitPrice, isFree } = parsePrice(event.price);

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<EventTicket | null>(null);

  const total = isFree ? 0 : unitPrice * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await purchaseTicket(
        {
          eventSlug: event.slug,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          restaurantSlug: event.restaurantSlug,
          restaurantName: event.restaurantName,
          quantity,
          unitPrice,
          isFree,
          buyerName: name,
          buyerEmail: email,
          buyerPhone: phone,
        },
        user.id
      );
      setConfirmed(ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'acquisto");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <aside className="booking-panel" aria-label="Biglietto confermato">
        <div className="booking-confirmed" style={{ padding: 0 }}>
          <div className="booking-confirmed__icon" aria-hidden="true">✓</div>
          <p className="eyebrow">{confirmed.isFree ? "Iscrizione confermata" : "Acquisto confermato"}</p>
          <h1>{confirmed.eventTitle}</h1>
          <p className="booking-confirmed__ref">{confirmed.ticketRef}</p>
          <div className="booking-confirmed__details">
            <span>{confirmed.quantity} {confirmed.quantity === 1 ? "biglietto" : "biglietti"}</span>
            <span>·</span>
            <span>{confirmed.isFree ? "Free entry" : `€${confirmed.totalPrice.toFixed(2)}`}</span>
          </div>
          <p className="booking-confirmed__note">
            {confirmed.isFree
              ? <>Conferma inviata a <strong>{confirmed.buyerEmail}</strong>. Presentala all'ingresso.</>
              : <>Ricevuta e biglietto inviati a <strong>{confirmed.buyerEmail}</strong>.</>}
          </p>
          <div className="booking-confirmed__actions">
            <button type="button" className="clay-button clay-button--primary" onClick={() => downloadTicket(confirmed)}>
              Scarica biglietto
            </button>
            <ClayLink href="/profile/eventi" variant="secondary">I miei eventi</ClayLink>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="booking-panel" id="biglietti" aria-label="Acquista il biglietto">
      <div className="bp-header">
        <p className="eyebrow">{isFree ? "Ingresso gratuito" : "Acquista il biglietto"}</p>
        <p className="bp-social-proof">{event.date} · {event.location}</p>
      </div>

      <div>
        <p className="bp-label-text">Quantità</p>
        <div className="bp-guests">
          <button
            type="button"
            className="bp-guests__btn"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Riduci"
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="bp-guests__count">
            {quantity} {quantity === 1 ? "biglietto" : "biglietti"}
          </span>
          <button
            type="button"
            className="bp-guests__btn"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            aria-label="Aumenta"
            disabled={quantity >= 10}
          >
            +
          </button>
        </div>
      </div>

      {!isFree && (
        <div className="bp-offer">
          <strong>Totale: €{total.toFixed(2)}</strong>
          <span>€{unitPrice.toFixed(2)} a biglietto</span>
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label className="bp-label">
            Nome completo
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Mario Rossi" />
          </label>
          <label className="bp-label">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mario@email.com" />
          </label>
          <label className="bp-label">
            Telefono <span style={{ fontWeight: 400 }}>(facoltativo)</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39 333 000 0000" />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" className="clay-button clay-button--primary bp-cta" disabled={submitting}>
            {submitting ? "Elaborazione…" : isFree ? "Conferma iscrizione gratuita" : `Paga €${total.toFixed(2)} e acquista`}
          </button>
        </form>
      ) : (
        <Link
          href={`/login?from=${encodeURIComponent(`/events/${event.slug}`)}`}
          className="clay-button clay-button--primary bp-cta"
        >
          Accedi per continuare
        </Link>
      )}

      <div className="bp-trust">
        <span>✓ Conferma immediata</span>
        <span>✓ Ricevuta via email</span>
      </div>
    </aside>
  );
}
