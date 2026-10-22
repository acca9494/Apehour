import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTransactionalEmail, emailShell, escapeHtml } from "@/lib/email/send";

// Email di conferma/cancellazione prenotazione. Chiamata dal client subito dopo
// createBooking/cancelBooking (fire-and-forget, non blocca la UI). Rilegge la
// prenotazione lato server con la service role invece di fidarsi del corpo
// della richiesta, così il contenuto dell'email riflette sempre il dato vero.
export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ ok: false }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "unknown" }, { status: 400 });
  }

  const bookingId = typeof body.bookingId === "string" ? body.bookingId : null;
  const kind = body.kind === "cancelled" ? "cancelled" : "confirmed";
  if (!bookingId) return NextResponse.json({ error: "unknown" }, { status: 400 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: booking, error } = await admin
    .from("bookings")
    .select("booking_ref, restaurant_id, date, start_time, guests, customer_name, customer_email")
    .eq("id", bookingId)
    .maybeSingle();
  if (error || !booking || !booking.customer_email) {
    return NextResponse.json({ ok: false });
  }

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("name, address, city")
    .eq("id", booking.restaurant_id)
    .maybeSingle();

  const dateLabel = new Date(`${booking.date}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long",
  });
  const timeLabel = String(booking.start_time).slice(0, 5);
  const venueName = restaurant?.name ?? "il locale";

  const isCancelled = kind === "cancelled";
  const rows: [string, string][] = [
    ["Locale", venueName],
    ["Data", dateLabel],
    ["Orario", timeLabel],
    ["Ospiti", String(booking.guests)],
    ["Codice prenotazione", booking.booking_ref],
  ];

  await sendTransactionalEmail({
    to: booking.customer_email,
    subject: isCancelled
      ? `Prenotazione cancellata — ${venueName}`
      : `Prenotazione confermata — ${venueName}`,
    html: emailShell({
      heading: isCancelled ? "Prenotazione cancellata" : "Prenotazione confermata!",
      bodyHtml:
        `<p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#49473D;">` +
        (isCancelled
          ? `Ciao ${escapeHtml(booking.customer_name)}, la tua prenotazione è stata cancellata.`
          : `Ciao ${escapeHtml(booking.customer_name)}, ti aspettiamo da <strong>${escapeHtml(venueName)}</strong>!`) +
        `</p>` +
        `<table cellpadding="4" style="border-collapse:collapse; font-size:14px; color:#1A1915;">` +
        rows.map(([k, v]) => `<tr><td style="color:#7A7870; padding-right:12px;">${escapeHtml(k)}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join("") +
        `</table>`,
    }),
  });

  return NextResponse.json({ ok: true });
}
