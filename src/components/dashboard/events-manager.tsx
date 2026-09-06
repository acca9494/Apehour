"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getMyRestaurant, type RestaurantRow } from "@/lib/restaurants/service";
import { slugify, todayInputValue } from "@/lib/utils";
import { CalendarDropdown } from "@/components/ui/calendar-dropdown";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import {
  listMyEvents,
  upsertEvent,
  deleteEvent,
  getParticipantsForEvent,
  type EventInput,
} from "@/lib/events/service";
import {
  getEventParticipants,
  updateTicketRequestStatus,
  type EventParticipant,
} from "@/lib/tickets/service";
import { Modal } from "@/components/ui/modal";
import type { EventItem } from "@/lib/data/events";

const CATEGORIES = [
  "Festival", "Musica Live", "DJ Set", "Degustazione", "Speciale", "Cocktail",
  "Aperitivo", "Karaoke", "Quiz Night", "Silent Disco", "Stand-up Comedy", "Vinyl Night", "Workshop",
];

// Stesse città usate dal filtro pubblico in /events — devono corrispondere
// esattamente, altrimenti un evento sparisce dal filtro senza errore.
const CITIES = ["Roma", "Ostia", "Fregene", "Ladispoli"];

type EditingEvent = EventInput & { id: string | null };

function emptyEvent(): EditingEvent {
  return {
    id: null,
    title: "",
    eventDate: "",
    eventEndDate: "",
    startTime: "18:00",
    location: "",
    image: "",
    category: CATEGORIES[0]!,
    description: "",
    slug: "",
  };
}

// Il campo "location" è "Città" o "Città, Zona" — separiamo le due parti per il form.
function splitLocation(location: string): { city: string; zone: string } {
  const [first, ...rest] = location.split(",");
  const city = first?.trim() ?? "";
  return { city: CITIES.includes(city) ? city : CITIES[0]!, zone: rest.join(",").trim() };
}

export function EventsManager() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditingEvent | null>(null);
  const [eventDate, setEventDate] = useState(todayInputValue());
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventTime, setEventTime] = useState("18:00");
  const [eventCity, setEventCity] = useState(CITIES[0]!);
  const [eventZone, setEventZone] = useState("");
  const [viewingEvent, setViewingEvent] = useState<EventItem | null>(null);
  const [viewingList, setViewingList] = useState<EventParticipant[]>([]);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const r = await getMyRestaurant(user.id);
      setRestaurant(r);
      if (r) {
        const evs = await listMyEvents(r.id);
        setEvents(evs);
        const counts = await Promise.all(evs.map((e) => getParticipantsForEvent(e.id)));
        setParticipants(Object.fromEntries(evs.map((e, i) => [e.id, counts[i]!])));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() {
    if (!restaurant) return;
    setEditing(emptyEvent());
    setEventDate(todayInputValue());
    setEventEndDate("");
    setEventTime("18:00");
    setEventCity(CITIES[0]!);
    setEventZone("");
  }

  function openEdit(e: EventItem) {
    const { city, zone } = splitLocation(e.location);
    setEventCity(city);
    setEventZone(zone);
    setEditing({
      id: e.id,
      title: e.title,
      eventDate: "",
      eventEndDate: "",
      startTime: "18:00",
      location: e.location,
      image: e.image,
      category: e.category,
      description: e.description,
      slug: e.slug,
    });
    setEventDate(todayInputValue());
    setEventEndDate("");
    setEventTime("18:00");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !restaurant || !editing || !editing.title.trim() || !eventDate || !editing.image) return;
    setSaving(true);
    try {
      const slug = editing.slug || slugify(editing.title);
      const location = eventZone.trim() ? `${eventCity}, ${eventZone.trim()}` : eventCity;
      await upsertEvent(editing.id, { ...editing, slug, location, eventDate, eventEndDate, startTime: eventTime }, restaurant.id);
      await load();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo evento?")) return;
    await deleteEvent(id);
    await load();
  }

  async function openParticipants(e: EventItem) {
    setViewingEvent(e);
    setViewingLoading(true);
    try {
      setViewingList(await getEventParticipants(e.id));
    } finally {
      setViewingLoading(false);
    }
  }

  async function handleRequestStatus(id: string, status: "confirmed" | "cancelled") {
    setUpdatingId(id);
    try {
      await updateTicketRequestStatus(id, status);
      setViewingList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      if (viewingEvent) {
        const counts = await getParticipantsForEvent(viewingEvent.id);
        setParticipants((prev) => ({ ...prev, [viewingEvent.id]: counts }));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <div className="dash-loading">Caricamento eventi…</div>;
  }

  return (
    <div className="avail-manager">
      <div className="dashboard-page-header">
        <p className="eyebrow">Eventi</p>
        <h1>Crea i tuoi eventi</h1>
        <p>Pubblica un evento con tutti i dettagli: apparirà nella pagina Eventi del sito.</p>
      </div>

      <div className="avail-summary-bar">
        <div className="avail-summary-item">
          <strong>{events.length}</strong>
          <span>Eventi pubblicati</span>
        </div>
        <button type="button" className="clay-button clay-button--primary avail-save-btn" onClick={openNew} disabled={!restaurant}>
          + Nuovo evento
        </button>
      </div>

      {editing && (
        <div className="dash-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>{editing.id ? "Modifica evento" : "Nuovo evento"}</h3>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.9rem", maxWidth: 520 }}>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Titolo evento
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Es. Sunset Jazz & Spritz"
                required
              />
            </label>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Data <span style={{ fontWeight: 400, textTransform: "none" }}>(clicca due giorni per un intervallo)</span>
                </span>
                <CalendarDropdown
                  compact
                  value={eventDate}
                  onChange={setEventDate}
                  rangeEnd={eventEndDate}
                  onRangeEndChange={setEventEndDate}
                />
              </div>
              <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Ora
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required />
              </label>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Città
                <select value={eventCity} onChange={(e) => setEventCity(e.target.value)} required>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
                Zona <span style={{ fontWeight: 400, textTransform: "none" }}>(facoltativo)</span>
                <input
                  value={eventZone}
                  onChange={(e) => setEventZone(e.target.value)}
                  placeholder="Es. Trastevere"
                />
              </label>
            </div>
            <ImageUploadField
              label="Immagine evento"
              value={editing.image}
              onChange={(dataUrl) => setEditing({ ...editing, image: dataUrl })}
            />
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Categoria
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="auth-form__label" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              Descrizione
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                placeholder="Racconta l'evento in poche righe…"
                required
              />
            </label>

            <div>
              <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>Come si accede all&apos;evento</span>
              <div
                style={{
                  padding: "0.7rem 0.85rem",
                  border: "1.5px solid var(--border, #e5e3dc)",
                  borderRadius: 12,
                  background: "var(--gold-soft, #fbeed3)",
                }}
              >
                <span style={{ display: "block", fontWeight: 700, fontSize: "0.9rem" }}>Prenotazione (waitlist)</span>
                <span style={{ display: "block", fontSize: "0.78rem", opacity: 0.75 }}>
                  Nessun pagamento in app: il cliente richiede un posto, tu confermi la sua presenza. In questa fase i biglietti a pagamento non sono ancora disponibili.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button type="submit" className="mreg__btn mreg__btn--primary" disabled={saving}>
                {saving ? "Salvataggio…" : "Salva evento"}
              </button>
              <button type="button" className="booking3-back" onClick={() => setEditing(null)}>Annulla</button>
            </div>
          </form>
        </div>
      )}

      <div className="dash-table-card">
        {events.length === 0 ? (
          <div className="dash-empty">
            <p>Nessun evento creato finora.</p>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Data</th>
                <th>Categoria</th>
                <th>Accesso</th>
                <th>Richieste</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <button
                      type="button"
                      className="dash-table__name"
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", textDecoration: "underline", textAlign: "left" }}
                      onClick={() => openParticipants(e)}
                    >
                      {e.title}
                    </button>
                  </td>
                  <td className="dash-table__muted">{e.date}</td>
                  <td className="dash-table__muted">{e.category}</td>
                  <td className="dash-table__muted">{e.price}</td>
                  <td className="dash-table__center">{participants[e.id] ?? 0}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button type="button" className="mbk-action-btn" onClick={() => openEdit(e)}>Modifica</button>
                      <button type="button" className="dash-action-btn dash-action-btn--reject" onClick={() => handleDelete(e.id)}>Elimina</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        title={viewingEvent ? `Prenotazioni — ${viewingEvent.title}` : "Prenotazioni"}
        wide
      >
        {viewingLoading ? (
          <p className="dash-empty">Caricamento…</p>
        ) : viewingList.length === 0 ? (
          <p className="dash-empty">Nessuna richiesta ancora per questo evento.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {viewingList.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                  padding: "0.75rem 0.9rem", border: "1px solid var(--border, #e5e3dc)", borderRadius: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: "0.9rem" }}>{p.buyerName}</strong>
                  <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.7 }}>{p.buyerEmail}</span>
                  {p.buyerPhone && <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.7 }}>{p.buyerPhone}</span>}
                  <span style={{ display: "block", fontSize: "0.78rem", opacity: 0.55, marginTop: "0.2rem" }}>
                    {p.quantity} {p.quantity === 1 ? "posto" : "posti"} · {p.ticketRef}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                  <span className={`dash-badge dash-badge--${p.status === "confirmed" ? "confirmed" : p.status === "cancelled" ? "cancelled" : "pending"}`}>
                    {p.status === "confirmed" ? "Confermata" : p.status === "cancelled" ? "Annullata" : "In attesa"}
                  </span>
                  {p.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="dash-action-btn dash-action-btn--confirm"
                        disabled={updatingId === p.id}
                        onClick={() => handleRequestStatus(p.id, "confirmed")}
                      >
                        {updatingId === p.id ? "…" : "✓"}
                      </button>
                      <button
                        type="button"
                        className="dash-action-btn dash-action-btn--reject"
                        disabled={updatingId === p.id}
                        onClick={() => handleRequestStatus(p.id, "cancelled")}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
