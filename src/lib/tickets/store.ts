import type { EventTicket } from "./types";

function ticketsKey(buyerId: string) { return `appape_tickets_${buyerId}`; }

export function getTickets(buyerId: string): EventTicket[] {
  try {
    const raw = localStorage.getItem(ticketsKey(buyerId));
    return raw ? (JSON.parse(raw) as EventTicket[]) : [];
  } catch {
    return [];
  }
}

export function saveTickets(tickets: EventTicket[], buyerId: string): void {
  localStorage.setItem(ticketsKey(buyerId), JSON.stringify(tickets));
}

export function addTicket(ticket: EventTicket): void {
  const all = getTickets(ticket.buyerId);
  saveTickets([...all, ticket], ticket.buyerId);
}

// Merchant-side lookup: total participants (ticket quantity) for one of their events.
// Mock limitation: scans this browser's localStorage only (no shared backend yet).
export function getParticipantsForEvent(eventSlug: string): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("appape_tickets_")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const tickets = JSON.parse(raw) as EventTicket[];
      for (const t of tickets) {
        if (t.eventSlug === eventSlug && t.status !== "cancelled") total += t.quantity;
      }
    }
  } catch {}
  return total;
}
