"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { createPickupOrder } from "@/lib/pickup/service";

export function PickupOrderPanel({ restaurantId, restaurantSlug }: { restaurantId: string; restaurantSlug: string }) {
  const { user } = useAuth();
  const [itemDescription, setItemDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await createPickupOrder({
        restaurantId,
        customerId: user.id,
        customerName: user.name,
        customerPhone: phone,
        itemDescription,
      });
      setOrderRef(order.orderRef);
    } catch {
      setError("Non siamo riusciti a inviare l'ordine. Riprova tra un attimo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderRef) {
    return (
      <section className="detail-block pickup-panel pickup-panel--done">
        <h2>Ordine inviato!</h2>
        <p>
          Il tuo codice è <strong>{orderRef}</strong>. Appena è pronto lo vedrai segnato qui:
        </p>
        <Link href="/profile/ordini" className="clay-button clay-button--primary">
          Vai a &quot;I miei ordini&quot;
        </Link>
      </section>
    );
  }

  return (
    <section className="detail-block pickup-panel" id="ordina-da-fuori">
      <h2>Sei seduto fuori? Ordina da qui</h2>
      <p className="settings-hint">
        Lascia cosa vuoi e un numero per sicurezza — appena è pronto te lo segnaliamo, vai tu a ritirarlo al bancone e lo porti al tuo tavolo (si paga lì).
      </p>

      {!user ? (
        <Link href={`/login?from=${encodeURIComponent(`/restaurants/${restaurantSlug}#ordina-da-fuori`)}`} className="clay-button clay-button--primary">
          Accedi per ordinare
        </Link>
      ) : (
        <form className="settings-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <label className="settings-form__full">
            Cosa vuoi ordinare? <em>*</em>
            <textarea
              rows={2}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Es. 2 spritz e una tagliata di formaggi"
              required
            />
          </label>
          <label>
            Numero di telefono <em>*</em>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+39 346 0000000"
              required
            />
          </label>
          <button type="submit" className="clay-button clay-button--primary" disabled={submitting}>
            {submitting ? "Invio…" : "Invia ordine"}
          </button>
        </form>
      )}
    </section>
  );
}
