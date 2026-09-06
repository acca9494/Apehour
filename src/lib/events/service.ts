import { createClient } from "@/lib/supabase/client";
import type { EventItem } from "@/lib/data/events";

interface EventRow {
  id: string;
  restaurant_id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  event_end_date: string | null;
  start_time: string;
  location: string;
  ticket_mode: "paid" | "free" | "waitlist";
  price_label: string;
  bees_reward: number;
  is_active: boolean;
  restaurants: { slug: string; name: string } | null;
}

const SELECT_WITH_RESTAURANT = "*, restaurants(slug, name)";

function formatDayLabel(iso: string, withMonth = true): string {
  const opts: Intl.DateTimeFormatOptions = withMonth
    ? { weekday: "short", day: "numeric", month: "short" }
    : { day: "numeric" };
  const label = new Date(iso + "T00:00:00").toLocaleDateString("it-IT", opts);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function formatEventDateLabel(eventDate: string, eventEndDate: string | null, startTime: string): string {
  const isRange = eventEndDate && eventEndDate !== eventDate;
  const dateLabel = isRange
    ? `Dal ${formatDayLabel(eventDate, false)} al ${formatDayLabel(eventEndDate)}`
    : formatDayLabel(eventDate);
  return `${dateLabel} · ${startTime.slice(0, 5)}`;
}

function mapRow(row: EventRow): EventItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: formatEventDateLabel(row.event_date, row.event_end_date, row.start_time),
    location: row.location,
    image: row.image_url ?? "",
    category: row.category,
    price: row.price_label,
    ticketMode: row.ticket_mode,
    bees: row.bees_reward,
    description: row.description ?? "",
    restaurantSlug: row.restaurants?.slug ?? "",
    restaurantName: row.restaurants?.name ?? "",
  };
}

export interface EventInput {
  title: string;
  eventDate: string;
  eventEndDate?: string;
  startTime: string;
  location: string;
  image: string;
  category: string;
  description: string;
  slug: string;
}

export async function listMyEvents(restaurantId: string): Promise<EventItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(SELECT_WITH_RESTAURANT)
    .eq("restaurant_id", restaurantId)
    .order("event_date", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as EventRow[]).map(mapRow);
}

export async function upsertEvent(id: string | null, input: EventInput, restaurantId: string): Promise<void> {
  const supabase = createClient();
  const payload = {
    restaurant_id: restaurantId,
    title: input.title,
    slug: input.slug,
    category: input.category,
    description: input.description,
    image_url: input.image,
    event_date: input.eventDate,
    event_end_date: input.eventEndDate || null,
    start_time: input.startTime,
    location: input.location,
    ticket_mode: "waitlist" as const,
    price_label: "Su prenotazione",
    bees_reward: 20,
  };

  if (id) {
    const { error } = await supabase.from("events").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("events").insert(payload);
    if (error) throw new Error(error.message);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAllActiveEvents(): Promise<EventItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(SELECT_WITH_RESTAURANT)
    .eq("is_active", true)
    .order("event_date", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as EventRow[]).map(mapRow);
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(SELECT_WITH_RESTAURANT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as unknown as EventRow) : null;
}

export async function getParticipantsForEvent(eventId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ticket_requests")
    .select("quantity")
    .eq("event_id", eventId)
    .neq("status", "cancelled");
  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, r) => sum + (r.quantity as number), 0);
}
