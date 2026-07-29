"use client";

import { useEffect, useRef, useState } from "react";
import { fetchTables, saveTable, removeTable } from "@/lib/merchant/service";
import { getZones, addZone } from "@/lib/merchant/store";
import type { MerchantTable, TableStatus } from "@/lib/merchant/store";
import { useAuth } from "@/lib/auth/context";

const ZONE_COLOR_PALETTE = ["#F5A800", "#22C55E", "#3B82F6", "#A855F7", "#EF4444", "#14B8A6", "#F97316", "#EC4899"];

function zoneColor(zone: string, zones: string[]): string {
  const idx = zones.indexOf(zone);
  return ZONE_COLOR_PALETTE[idx % ZONE_COLOR_PALETTE.length] ?? "var(--border)";
}

const MIN_SIZE = 60;
const MAX_SIZE = 240;
const CANVAS_W = 900;
const CANVAS_H = 520;

function generateId() {
  return `tbl-${Date.now()}`;
}

const EMPTY_TABLE: Omit<MerchantTable, "id"> = {
  name: "",
  capacity: 2,
  zone: "Interno",
  status: "active",
  x: 40,
  y: 40,
  width: 100,
  height: 90,
};

function EditPanel({
  table,
  zones,
  onSave,
  onDelete,
  onClose,
  deleting,
}: {
  table: MerchantTable;
  zones: string[];
  onSave: (t: MerchantTable) => Promise<void>;
  onDelete: (id: string) => void;
  onClose: () => void;
  deleting: boolean;
}) {
  const [form, setForm] = useState(table);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(table), [table]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="table-edit-panel">
      <div className="table-edit-panel__head">
        <h3>Modifica tavolo</h3>
        <button type="button" className="artist-back-link" onClick={onClose}>✕ Chiudi</button>
      </div>
      <form className="table-edit-panel__form" onSubmit={handleSubmit}>
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
        {form.zone !== "Bancone" && (
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
        )}
        <label>
          Zona
          <select
            value={form.zone}
            onChange={(e) => {
              const zone = e.target.value;
              setForm({ ...form, zone, capacity: zone === "Bancone" ? 1 : form.capacity });
            }}
          >
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </label>
        <label>
          Stato
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TableStatus })}>
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
          </select>
        </label>
        <div className="table-edit-panel__size-row">
          <label>
            Larghezza
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={form.width}
              onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
            />
          </label>
          <label>
            Altezza
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={form.height}
              onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="table-form__actions">
          <button type="submit" className="clay-button clay-button--primary" disabled={saving}>
            {saving ? "Salvataggio…" : "Salva"}
          </button>
          <button
            type="button"
            className="table-card__btn table-card__btn--delete"
            disabled={deleting}
            onClick={() => onDelete(form.id)}
          >
            {deleting ? "…" : "Elimina tavolo"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function TableManager() {
  const { user } = useAuth();
  const [tables, setTables] = useState<MerchantTable[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingZone, setAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    setZones(getZones(user.id));
    fetchTables(user.id).then((t) => { setTables(t); setLoading(false); });
  }, [user]);

  async function persist(table: MerchantTable) {
    if (!user) return;
    await saveTable(table, user.id);
  }

  async function handleSave(table: MerchantTable) {
    await persist(table);
    setTables((prev) => {
      const exists = prev.some((t) => t.id === table.id);
      return exists ? prev.map((t) => (t.id === table.id ? table : t)) : [...prev, table];
    });
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!user) return;
    setDeletingId(id);
    await removeTable(id, user.id);
    setTables((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
    setEditingId(null);
  }

  function nextFreeSpot(): { x: number; y: number } {
    const n = tables.length;
    const col = n % 6;
    const row = Math.floor(n / 6);
    return { x: 40 + col * 130, y: 40 + row * 130 };
  }

  function handleAdd(zone?: string) {
    const spot = nextFreeSpot();
    const finalZone = zone ?? zones[0] ?? EMPTY_TABLE.zone;
    const newTable: MerchantTable = {
      id: generateId(),
      ...EMPTY_TABLE,
      zone: finalZone,
      capacity: finalZone === "Bancone" ? 1 : EMPTY_TABLE.capacity,
      x: spot.x,
      y: spot.y,
    };
    setTables((prev) => [...prev, newTable]);
    setEditingId(newTable.id);
    void persist(newTable);
  }

  function handleAddZone(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newZoneName.trim()) return;
    const updated = addZone(newZoneName.trim(), user.id);
    setZones(updated);
    setNewZoneName("");
    setAddingZone(false);
  }

  // ── Free drag within the floor canvas ──────────────────────────
  function handlePointerDown(e: React.PointerEvent, table: MerchantTable) {
    if ((e.target as HTMLElement).closest(".floor-table__resize")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragState.current = {
      id: table.id,
      offsetX: e.clientX - rect.left - table.x,
      offsetY: e.clientY - rect.top - table.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const drag = dragState.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const table = tables.find((t) => t.id === drag.id);
    if (!table) return;
    const nextX = Math.max(0, Math.min(CANVAS_W - table.width, e.clientX - rect.left - drag.offsetX));
    const nextY = Math.max(0, Math.min(CANVAS_H - table.height, e.clientY - rect.top - drag.offsetY));
    setTables((prev) => prev.map((t) => (t.id === drag.id ? { ...t, x: nextX, y: nextY } : t)));
  }

  function handlePointerUp() {
    const drag = dragState.current;
    dragState.current = null;
    if (!drag) return;
    const table = tables.find((t) => t.id === drag.id);
    if (table) void persist(table);
  }

  // ── Free resize via corner handle ──────────────────────────────
  const resizeState = useRef<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

  function handleResizeDown(e: React.PointerEvent, table: MerchantTable) {
    e.stopPropagation();
    resizeState.current = { id: table.id, startX: e.clientX, startY: e.clientY, startW: table.width, startH: table.height };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleResizeMove(e: React.PointerEvent) {
    const resize = resizeState.current;
    if (!resize) return;
    const nextW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resize.startW + (e.clientX - resize.startX)));
    const nextH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, resize.startH + (e.clientY - resize.startY)));
    setTables((prev) => prev.map((t) => (t.id === resize.id ? { ...t, width: nextW, height: nextH } : t)));
  }

  function handleResizeUp() {
    const resize = resizeState.current;
    resizeState.current = null;
    if (!resize) return;
    const table = tables.find((t) => t.id === resize.id);
    if (table) void persist(table);
  }

  const totalCapacity = tables.filter((t) => t.status === "active").reduce((s, t) => s + t.capacity, 0);
  const activeCount = tables.filter((t) => t.status === "active").length;
  const editingTable = tables.find((t) => t.id === editingId) ?? null;

  if (loading) return <div className="dash-loading">Caricamento tavoli…</div>;

  return (
    <div className="table-manager">
      <div className="dashboard-page-header">
        <p className="eyebrow">Tavoli</p>
        <h1>Disponi la sala come vuoi</h1>
        <p>Trascina i tavoli per posizionarli liberamente, e ridimensionali dall&apos;angolo in basso a destra.</p>
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
        <button type="button" className="clay-button clay-button--primary" onClick={() => handleAdd()}>
          + Aggiungi tavolo
        </button>
      </div>

      <div className="floor-legend">
        {zones.map((z) => (
          <span key={z} className="floor-legend__item">
            <span className="floor-legend__dot" style={{ background: zoneColor(z, zones) }} />
            {z}
            <button
              type="button"
              className="floor-legend__add-btn"
              title={`Aggiungi tavolo in ${z}`}
              onClick={() => handleAdd(z)}
            >
              +
            </button>
          </span>
        ))}

        {addingZone ? (
          <form className="floor-add-zone" onSubmit={handleAddZone}>
            <input
              type="text"
              autoFocus
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="Nome zona"
            />
            <button type="submit">Aggiungi</button>
            <button type="button" className="artist-back-link" onClick={() => setAddingZone(false)}>Annulla</button>
          </form>
        ) : (
          <button type="button" className="floor-add-zone-btn" onClick={() => setAddingZone(true)}>
            + Aggiungi zona
          </button>
        )}
      </div>

      <div className="floor-layout">
        <div
          ref={canvasRef}
          className="floor-canvas"
          style={{ width: CANVAS_W, height: CANVAS_H }}
          onPointerMove={(e) => { handlePointerMove(e); handleResizeMove(e); }}
          onPointerUp={() => { handlePointerUp(); handleResizeUp(); }}
        >
          {tables.map((table) => (
            <div
              key={table.id}
              className={`floor-table${table.status === "inactive" ? " floor-table--inactive" : ""}${editingId === table.id ? " is-selected" : ""}`}
              style={{
                left: table.x,
                top: table.y,
                width: table.width,
                height: table.height,
                borderColor: zoneColor(table.zone, zones),
              }}
              onPointerDown={(e) => handlePointerDown(e, table)}
              onClick={() => setEditingId(table.id)}
            >
              <span className="floor-table__name">{table.name}</span>
              {table.zone !== "Bancone" && (
                <span className="floor-table__capacity">{table.capacity} 👤</span>
              )}
              <div
                className="floor-table__resize"
                onPointerDown={(e) => handleResizeDown(e, table)}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        {editingTable && (
          <EditPanel
            table={editingTable}
            zones={zones}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setEditingId(null)}
            deleting={deletingId === editingTable.id}
          />
        )}
      </div>
    </div>
  );
}
