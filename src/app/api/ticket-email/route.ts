import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTransactionalEmail, emailShell, escapeHtml } from "@/lib/email/send";

// Email di conferma richiesta biglietto (fase pilota: solo waitlist, nessun
// pagamento). Stesso schema di /api/booking-email: rilegge lato server con la
// service role invece di fidarsi del corpo della richiesta.
export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ ok: false }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "unknown" }, { status: 400 });
  }

  const ticketId = typeof body.ticketId === "string" ? body.ticketId : null;
  if (!ticketId) return NextResponse.json({ error: "unknown" }, { status: 400 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: ticket, error } = await admin
    .from("ticket_requests")
    .select("ticket_ref, quantity, buyer_name, buyer_email, event_id")
    .eq("id", ticketId)
    .maybeSingle();
  if (error || !ticket || !ticket.buyer_email) {
    return NextResponse.json({ ok: false });
  }

  const { data: event } = await admin
    .from("events")
    .select("title, event_date, start_time, location")
    .eq("id", ticket.event_id)
    .maybeSingle();

  const dateLabel = event
    ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const timeLabel = event ? String(event.start_time).slice(0, 5) : "";
  const eventTitle = event?.title ?? "l'evento";

  const rows: [string, string][] = [
    ["Evento", eventTitle],
    ["Data", dateLabel],
    ["Orario", timeLabel],
    ["Posti richiesti", String(ticket.quantity)],
    ["Codice richiesta", ticket.ticket_ref],
  ];

  await sendTransactionalEmail({
    to: ticket.buyer_email,
    subject: `Richiesta ricevuta — ${eventTitle}`,
    html: emailShell({
      heading: "Richiesta ricevuta!",
      bodyHtml:
        `<p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#49473D;">` +
        `Ciao ${escapeHtml(ticket.buyer_name)}, abbiamo ricevuto la tua richiesta per <strong>${escapeHtml(eventTitle)}</strong>. Il locale confermerà la tua presenza a breve.` +
        `</p>` +
        `<table cellpadding="4" style="border-collapse:collapse; font-size:14px; color:#1A1915;">` +
        rows.map(([k, v]) => `<tr><td style="color:#7A7870; padding-right:12px;">${escapeHtml(k)}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join("") +
        `</table>`,
    }),
  });

  return NextResponse.json({ ok: true });
}
