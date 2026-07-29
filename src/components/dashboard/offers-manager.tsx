"use client";

import { useEffect, useState } from "react";
import { fetchOffers, saveOffer, removeOffer } from "@/lib/merchant/service";
import type { MerchantOffer, ApeType } from "@/lib/merchant/store";
import { useAuth } from "@/lib/auth/context";

const APE_LABEL: Record<ApeType, string> = {
  "vespa-sprint": "Vespa Sprint",
  "ape-plus": "Ape Plus",
  "bombo-queen": "Bombo Queen",
};

function emptyOffer(): MerchantOffer {
  return { id: `offer-${Date.now()}`, title: "", description: "", discount: 10, apeType: undefined };
}

export function OffersManager() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<MerchantOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MerchantOffer | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchOffers(user.id).then((o) => {
      setOffers(o);
      setLoading(false);
    });
  }, [user]);

  async function handleSave() {
    if (!user || !editing) return;
    setSaving(true);
    try {
      await saveOffer(editing, user.id);
      setOffers(await fetchOffers(user.id));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    if (!confirm("Eliminare questa offerta?")) return;
    await removeOffer(id, user.id);
    setOffers(await fetchOffers(user.id));
  }

  if (loading) {
    return <div className="dash-loading">Caricamento offerte…</div>;
  }

  return (
    <div className="avail-manager">
      <div className="dashboard-page-header">
        <p className="eyebrow">Offerte</p>
        <h1>Gestisci le tue offerte</h1>
        <p>Crea sconti e promozioni visibili nella pagina Offerte del sito.</p>
      </div>

      <div className="avail-summary-bar">
        <div className="avail-summary-item">
          <strong>{offers.length}</strong>
          <span>Offerte attive</span>
        </div>
        <button
          type="button"
          className="clay-button clay-button--primary avail-save-btn"
          onClick={() => setEditing(emptyOffer())}
        >
          + Nuova offerta
        </button>
      </div>

      {editing && (
        <div className="dash-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>{offers.some((o) => o.id === editing.id) ? "Modifica offerta" : "Nuova offerta"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", maxWidth: 480 }}>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Titolo
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Es. Aperitivo romantico"
              />
            </label>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Descrizione
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                placeholder="Descrivi l'offerta in poche righe…"
              />
            </label>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Sconto %
              <input
                type="number"
                min={0}
                max={90}
                value={editing.discount}
                onChange={(e) => setEditing({ ...editing, discount: Number(e.target.value) })}
              />
            </label>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Tipo Ape <span style={{ fontWeight: 400, textTransform: "none" }}>(facoltativo)</span>
              <select
                value={editing.apeType ?? ""}
                onChange={(e) => setEditing({ ...editing, apeType: (e.target.value || undefined) as ApeType | undefined })}
              >
                <option value="">Nessuno</option>
                {(Object.keys(APE_LABEL) as ApeType[]).map((k) => (
                  <option key={k} value={k}>{APE_LABEL[k]}</option>
                ))}
              </select>
            </label>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button type="button" className="mreg__btn mreg__btn--primary" disabled={saving || !editing.title} onClick={handleSave}>
                {saving ? "Salvataggio…" : "Salva offerta"}
              </button>
              <button type="button" className="booking3-back" onClick={() => setEditing(null)}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-table-card">
        {offers.length === 0 ? (
          <div className="dash-empty">
            <p>Nessuna offerta creata finora.</p>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Titolo</th>
                <th>Sconto</th>
                <th>Tipo Ape</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="dash-table__name">{o.title}</span>
                    <div className="dash-table__email">{o.description}</div>
                  </td>
                  <td>-{o.discount}%</td>
                  <td className="dash-table__muted">{o.apeType ? APE_LABEL[o.apeType] : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button type="button" className="mbk-action-btn" onClick={() => setEditing(o)}>Modifica</button>
                      <button type="button" className="dash-action-btn dash-action-btn--reject" onClick={() => handleDelete(o.id)}>Elimina</button>
                    </div>
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
