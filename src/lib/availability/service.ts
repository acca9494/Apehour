import { createClient } from "@/lib/supabase/client";
import type { DayConfig, DayKey, SlotConfig } from "@/lib/merchant/store";

const DAY_ORDER: DayKey[] = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
const DAY_LABELS: Record<DayKey, string> = {
  lun: "Lunedì", mar: "Martedì", mer: "Mercoledì", gio: "Giovedì",
  ven: "Venerdì", sab: "Sabato", dom: "Domenica",
};
// getDay(): 0=domenica..6=sabato → il nostro ordine lun..dom
const JS_DAY_TO_KEY: DayKey[] = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h! * 60 + m! + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

interface ScheduleRow {
  id: string;
  days_of_week: string[];
  start_time: string;
  end_time: string;
  total_seats: number;
  discount_percent: number | null;
  label: string | null;
  is_active: boolean;
}

// ── Lato commerciante: template settimanale completo ────────────────────────

export async function getSchedule(restaurantId: string): Promise<DayConfig[]> {
  const supabase = createClient();
  const [{ data: rows, error: rowsErr }, { data: rest, error: restErr }] = await Promise.all([
    supabase.from("availability_schedules").select("*").eq("restaurant_id", restaurantId),
    supabase.from("restaurants").select("closed_days").eq("id", restaurantId).maybeSingle(),
  ]);
  if (rowsErr) {
    console.error("[getSchedule] availability_schedules error:", rowsErr.message, rowsErr);
    throw new Error(rowsErr.message);
  }
  if (restErr) {
    console.error("[getSchedule] restaurants error:", restErr.message, restErr);
    throw new Error(restErr.message);
  }

  const closedDays = new Set(((rest?.closed_days as string[]) ?? []) as DayKey[]);
  const allRows = (rows ?? []) as ScheduleRow[];

  return DAY_ORDER.map((day) => ({
    day,
    label: DAY_LABELS[day],
    open: !closedDays.has(day),
    slots: allRows
      .filter((r) => r.days_of_week[0] === day)
      .map((r): SlotConfig => ({
        id: r.id,
        time: r.start_time.slice(0, 5),
        label: r.label ?? "",
        totalSeats: r.total_seats,
        discount: r.discount_percent ?? undefined,
        active: r.is_active,
      })),
  }));
}

// Sostituzione completa (stessa semantica del mock: il salvataggio riscrive tutto).
export async function saveSchedule(config: DayConfig[], restaurantId: string): Promise<void> {
  const supabase = createClient();

  const { error: delErr } = await supabase
    .from("availability_schedules")
    .delete()
    .eq("restaurant_id", restaurantId);
  if (delErr) throw new Error(delErr.message);

  const rows = config.flatMap((day) =>
    day.slots.map((slot) => ({
      restaurant_id: restaurantId,
      days_of_week: [day.day],
      start_time: slot.time,
      end_time: addMinutes(slot.time, 30),
      total_seats: slot.totalSeats,
      discount_percent: slot.discount ?? 0,
      label: slot.label || null,
      is_active: slot.active,
    }))
  );

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from("availability_schedules").insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  const closedDays = config.filter((d) => !d.open).map((d) => d.day);
  const { error: updErr } = await supabase
    .from("restaurants")
    .update({ closed_days: closedDays })
    .eq("id", restaurantId);
  if (updErr) throw new Error(updErr.message);
}

// ── Lato pubblico: slot disponibili per una data precisa ─────────────────────

export interface PublicSlot {
  time: string;
  availableSeats: number;
  totalSeats: number;
  discount?: number;
  label?: string;
}

export async function getSlotsForDate(restaurantId: string, date: string): Promise<PublicSlot[]> {
  const supabase = createClient();
  const dayKey = JS_DAY_TO_KEY[new Date(`${date}T00:00:00`).getDay()]!;

  const { data: rows, error: rowsErr } = await supabase
    .from("availability_schedules")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .contains("days_of_week", [dayKey]);
  if (rowsErr) {
    console.error("[getSlotsForDate] error:", rowsErr.message, { restaurantId, date, dayKey });
    throw new Error(rowsErr.message);
  }

  // La tabella bookings è protetta da RLS (un cliente vede solo le proprie
  // prenotazioni): per il conteggio posti serve una vista aggregata pubblica
  // che non espone dati del singolo cliente, solo il totale ospiti per slot.
  const { data: occupancy, error: bookErr } = await supabase
    .from("booking_occupancy")
    .select("start_time, booked_guests")
    .eq("restaurant_id", restaurantId)
    .eq("date", date);
  if (bookErr) throw new Error(bookErr.message);

  const bookedByTime = new Map<string, number>();
  for (const b of occupancy ?? []) {
    const t = (b.start_time as string).slice(0, 5);
    bookedByTime.set(t, (bookedByTime.get(t) ?? 0) + (b.booked_guests as number));
  }

  return ((rows ?? []) as ScheduleRow[]).map((r) => {
    const time = r.start_time.slice(0, 5);
    const booked = bookedByTime.get(time) ?? 0;
    return {
      time,
      availableSeats: Math.max(r.total_seats - booked, 0),
      totalSeats: r.total_seats,
      discount: r.discount_percent ?? undefined,
      label: r.label ?? undefined,
    };
  });
}
