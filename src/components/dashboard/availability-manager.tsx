"use client";

import { useEffect, useState } from "react";
import { fetchAvailability, updateAvailability } from "@/lib/merchant/service";
import type { DayConfig, SlotConfig } from "@/lib/merchant/store";
import { useAuth } from "@/lib/auth/context";

function SlotRow({
  slot,
  onUpdate,
}: {
  slot: SlotConfig;
  onUpdate: (updated: SlotConfig) => void;
}) {
  return (
    <div className={`avail-slot-row${!slot.active ? " avail-slot-row--inactive" : ""}`}>
      <button
        type="button"
        className={`avail-toggle${slot.active ? " is-on" : ""}`}
        onClick={() => onUpdate({ ...slot, active: !slot.active })}
        aria-label={slot.active ? "Disattiva slot" : "Attiva slot"}
      >
        <span />
      </button>

      <input
        type="time"
        value={slot.time}
        className="avail-input avail-input--time"
        onChange={(e) => onUpdate({ ...slot, time: e.target.value })}
        disabled={!slot.active}
      />

      <input
        type="text"
        value={slot.label}
        placeholder="Etichetta"
        className="avail-input avail-input--label"
        onChange={(e) => onUpdate({ ...slot, label: e.target.value })}
        disabled={!slot.active}
      />

      <div className="avail-slot-row__seats">
        <label>Posti</label>
        <input
          type="number"
          value={slot.totalSeats}
          min={1}
          max={200}
          className="avail-input avail-input--number"
          onChange={(e) => onUpdate({ ...slot, totalSeats: Number(e.target.value) })}
          disabled={!slot.active}
        />
      </div>

      <div className="avail-slot-row__discount">
        <label>Sconto %</label>
        <input
          type="number"
          value={slot.discount ?? ""}
          min={0}
          max={80}
          placeholder="—"
          className="avail-input avail-input--number"
          onChange={(e) =>
            onUpdate({ ...slot, discount: e.target.value ? Number(e.target.value) : undefined })
          }
          disabled={!slot.active}
        />
      </div>
    </div>
  );
}

function DayPanel({
  day,
  onUpdate,
}: {
  day: DayConfig;
  onUpdate: (updated: DayConfig) => void;
}) {
  function addSlot() {
    const newSlot: SlotConfig = {
      id: `s-${Date.now()}`,
      time: "18:00",
      label: "Nuovo slot",
      totalSeats: 20,
      active: true,
    };
    onUpdate({ ...day, slots: [...day.slots, newSlot] });
  }

  function removeSlot(id: string) {
    onUpdate({ ...day, slots: day.slots.filter((s) => s.id !== id) });
  }

  function updateSlot(updated: SlotConfig) {
    onUpdate({ ...day, slots: day.slots.map((s) => (s.id === updated.id ? updated : s)) });
  }

  return (
    <div className={`avail-day-panel${!day.open ? " avail-day-panel--closed" : ""}`}>
      <div className="avail-day-panel__header">
        <div className="avail-day-panel__title">
          <button
            type="button"
            className={`avail-toggle${day.open ? " is-on" : ""}`}
            onClick={() => onUpdate({ ...day, open: !day.open })}
            aria-label={day.open ? "Chiudi giorno" : "Apri giorno"}
          >
            <span />
          </button>
          <strong>{day.label}</strong>
          <span className="avail-day-panel__status">{day.open ? "Aperto" : "Chiuso"}</span>
        </div>
        {day.open && (
          <button type="button" className="avail-add-slot" onClick={addSlot}>
            + Aggiungi slot
          </button>
        )}
      </div>

      {day.open && (
        <div className="avail-slots-list">
          {day.slots.length === 0 && (
            <p className="avail-no-slots">Nessuno slot configurato.</p>
          )}
          {day.slots.map((slot) => (
            <div key={slot.id} className="avail-slot-wrapper">
              <SlotRow slot={slot} onUpdate={updateSlot} />
              <button
                type="button"
                className="avail-remove-slot"
                onClick={() => removeSlot(slot.id)}
                aria-label="Rimuovi slot"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AvailabilityManager() {
  const { user } = useAuth();
  const [config, setConfig] = useState<DayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchAvailability(user.id).then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, [user]);

  function updateDay(updated: DayConfig) {
    setConfig((prev) => prev.map((d) => (d.day === updated.day ? updated : d)));
    setSaved(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await updateAvailability(config, user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const totalSeats = config
    .filter((d) => d.open)
    .flatMap((d) => d.slots.filter((s) => s.active))
    .reduce((sum, s) => sum + s.totalSeats, 0);

  const activeDays = config.filter((d) => d.open).length;
  const activeSlots = config.flatMap((d) => d.slots.filter((s) => s.active)).length;

  if (loading) {
    return <div className="dash-loading">Caricamento disponibilità…</div>;
  }

  return (
    <div className="avail-manager">
      <div className="dashboard-page-header">
        <p className="eyebrow">Disponibilità</p>
        <h1>Gestisci orari e slot</h1>
        <p>Configura apertura, fasce orarie e numero di posti per ogni giorno della settimana.</p>
      </div>

      <div className="avail-summary-bar">
        <div className="avail-summary-item">
          <strong>{activeDays}</strong>
          <span>Giorni aperti</span>
        </div>
        <div className="avail-summary-item">
          <strong>{activeSlots}</strong>
          <span>Slot attivi</span>
        </div>
        <div className="avail-summary-item">
          <strong>{totalSeats}</strong>
          <span>Posti settimanali</span>
        </div>
        <button
          type="button"
          className={`clay-button clay-button--primary avail-save-btn${saving ? " is-loading" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Salvataggio…" : saved ? "✓ Salvato" : "Salva modifiche"}
        </button>
      </div>

      <div className="avail-days-grid">
        {config.map((day) => (
          <DayPanel key={day.day} day={day} onUpdate={updateDay} />
        ))}
      </div>
    </div>
  );
}
