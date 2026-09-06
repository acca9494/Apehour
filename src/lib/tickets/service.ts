import { createClient } from "@/lib/supabase/client";
import { formatEventDateLabel } from "@/lib/events/service";
import type { EventTicket, TicketPurchaseFormData } from "./types";

interface TicketRow {
  id: string;
  ticket_ref: string;
  quantity: number;
  status: "confirmed" | "pending" | "cancelled";
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  requested_at: string;
  events: {
    slug: string;
    title: string;
    event_date: string;
    event_end_date: string | null;
    start_time: string;
    location: string;
    restaurants: { slug: string; name: string } | null;
  } | null;
}

const SELECT_WITH_EVENT = "*, events(slug, title, event_date, event_end_date, start_time, location, restaurants(slug, name))";

function mapRow(row: TicketRow, customerId: string): EventTicket {
  const ev = row.events;
  return {
    id: row.id,
    ticketRef: row.ticket_ref,
    eventSlug: ev?.slug ?? "",
    eventTitle: ev?.title ?? "",
    eventDate: ev ? formatEventDateLabel(ev.event_date, ev.event_end_date, ev.start_time) : "",
    eventLocation: ev?.location ?? "",
    restaurantSlug: ev?.restaurants?.slug ?? "",
    restaurantName: ev?.restaurants?.name ?? "",
    buyerId: customerId,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    buyerPhone: row.buyer_phone ?? "",
    quantity: row.quantity,
    unitPrice: 0,
    totalPrice: 0,
    isFree: true,
    mode: "waitlist",
    purchasedAt: row.requested_at,
    status: row.status,
  };
}

export async function purchaseTicket(formData: TicketPurchaseFormData, buyerId: string): Promise<EventTicket> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ticket_requests")
    .insert({
      event_id: formData.eventId,
      customer_id: buyerId,
      quantity: formData.quantity,
      buyer_name: formData.buyerName,
      buyer_email: formData.buyerEmail,
      buyer_phone: formData.buyerPhone,
    })
    .select(SELECT_WITH_EVENT)
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as unknown as TicketRow, buyerId);
}

export async function getMyTickets(buyerId: string): Promise<EventTicket[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ticket_requests")
    .select(SELECT_WITH_EVENT)
    .eq("customer_id", buyerId)
    .neq("status", "cancelled")
    .order("requested_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as TicketRow[]).map((r) => mapRow(r, buyerId));
}

// ── Lato commerciante: richieste per un proprio evento, con i dati cliente ──

export interface EventParticipant {
  id: string;
  ticketRef: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  quantity: number;
  status: "confirmed" | "pending" | "cancelled";
  requestedAt: string;
}

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ticket_requests")
    .select("id, ticket_ref, buyer_name, buyer_email, buyer_phone, quantity, status, requested_at")
    .eq("event_id", eventId)
    .order("requested_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    ticketRef: r.ticket_ref as string,
    buyerName: r.buyer_name as string,
    buyerEmail: r.buyer_email as string,
    buyerPhone: (r.buyer_phone as string | null) ?? "",
    quantity: r.quantity as number,
    status: r.status as "confirmed" | "pending" | "cancelled",
    requestedAt: r.requested_at as string,
  }));
}

export async function updateTicketRequestStatus(
  id: string,
  status: "confirmed" | "cancelled"
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("ticket_requests").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}
