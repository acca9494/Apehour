"use client";

import { useEffect, useState } from "react";
import { fetchTables, saveTable, removeTable } from "@/lib/merchant/service";
import type { MerchantTable, TableStatus } from "@/lib/merchant/store";
import { useAuth } from "@/lib/auth/context";

const ZONES = ["Interno", "Terrazza", "Bancone", "Esterno", "Privato"];

function generateId() {
  return `tbl-${Date.now()}`;
}

const EMPTY_TABLE: Omit<MerchantTable, "id"> = {
  name: "",
  capacity: 2,
  zone: "Interno",
  status: "active",
};

function TableForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: MerchantTable;
  onSave: (t: MerchantTable) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form className="table-form" onSubmit={handleSubmit}>
      <div className="table-form__row">
        <label>
          Nome tavolo
          <input
            type="text"
            value={form.name}
            placeholder="es. Tavolo 5"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Capienza
          <input
            type="number"
            value={form.capacity}
            min={1}
            max={50}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
        </label>
        <label>
          Zona
          <select
            value={form.zone}
            onChange={(e) => setForm({ ...form, zone: e.target.value })}
          >
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </label>
        <label>
          Stato
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as TableStatus })}
          >
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
          </select>
        </label>
      </div>
      <div className="table-form__actions">
        <button type="submit" className="clay-button clay-button--primary" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva"}
        </button>
        <button type="button" className="clay-button clay-button--secondary" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </form>
  );
}

export function TableManager() {
  const { user } = useAuth();
  const [tables, setTables] = useState<MerchantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchTables(user.id).then((t) => { setTables(t); setLoading(false); });
  }, [user]);

  async function handleSave(table: MerchantTable) {
    if (!user) return;
    await saveTable(table, user.id);
    const updated = await fetchTables(user.id);
    setTables(updated);
    setEditingId(null);
    setAddingNew(false);
  }

  async function handleDelete(id: string) {
    if (!user) return;
    setDeletingId(id);
    await removeTable(id, user.id);
    const updated = await fetchTables(user.id);
    setTables(updated);
    setDeletingId(null);
  }

  async function toggleStatus(table: MerchantTable) {
    if (!user) return;
    const updated: MerchantTable = {
      ...table,
      status: table.status === "active" ? "inactive" : "active",
    };
    await saveTable(updated, user.id);
    setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  const zones = [...new Set(tables.map((t) => t.zone))];
  const totalCapacity = tables.filter((t) => t.status === "active").reduce((s, t) => s + t.capacity, 0);
  const activeCount = tables.filter((t) => t.status === "active").length;

  if (loading) return <div className="dash-loading">Caricamento tavoli…</div>;

  return (
    <div className="table-manager">
      <div className="dashboard-page-header">
        <p className="eyebrow">Tavoli</p>
        <h1>Gestisci tavoli e capienza</h1>
        <p>Configura tavoli, zone e capacità del tuo locale.</p>
      </div>

      <div className="avail-summary-bar">
        <div className="avail-summary-item">
          <strong>{tables.length}</strong>
          <span>Tavoli totali</span>
        </div>
        <div className="avail-summary-item">
          <strong>{activeCount}</strong>
          <span>Attivi</span>
        </div>
        <div className="avail-summary-item">
          <strong>{totalCapacity}</strong>
          <span>Posti totali</span>
        </div>
        <button
          type="button"
          className="clay-button clay-button--primary"
          onClick={() => { setAddingNew(true); setEditingId(null); }}
          disabled={addingNew}
        >
          + Aggiungi tavolo
        </button>
      </div>

      {addingNew && (
        <div className="dash-table-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Nuovo tavolo</h3>
          <TableForm
            initial={{ id: generateId(), ...EMPTY_TABLE }}
            onSave={handleSave}
            onCancel={() => setAddingNew(false)}
          />
        </div>
      )}

      {zones.map((zone) => {
        const zoneTables = tables.filter((t) => t.zone === zone);
        return (
          <div key={zone} className="dash-table-card table-zone-card">
            <div className="table-zone-header">
              <h3>{zone}</h3>
              <span>{zoneTables.filter((t) => t.status === "active").length} attivi · {zoneTables.reduce((s, t) => s + t.capacity, 0)} posti</span>
            </div>
            <div className="table-grid">
              {zoneTables.map((table) => (
                <div key={table.id}>
                  {editingId === table.id ? (
                    <TableForm
                      initial={table}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className={`table-card${table.status === "inactive" ? " table-card--inactive" : ""}`}>
                      <div className="table-card__top">
                        <div className="table-card__icon">⊞</div>
                        <button
                          type="button"
                          className={`avail-toggle${table.status === "active" ? " is-on" : ""}`}
                          onClick={() => toggleStatus(table)}
                          aria-label="Attiva/disattiva"
                        >
                          <span />
                        </button>
                      </div>
                      <div className="table-card__name">{table.name}</div>
                      <div className="table-card__capacity">{table.capacity} {table.capacity === 1 ? "posto" : "posti"}</div>
                      <div className="table-card__actions">
                        <button
                          type="button"
                          className="table-card__btn"
                          onClick={() => { setEditingId(table.id); setAddingNew(false); }}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          className="table-card__btn table-card__btn--delete"
                          disabled={deletingId === table.id}
                          onClick={() => handleDelete(table.id)}
                        >
                          {deletingId === table.id ? "…" : "Elimina"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
