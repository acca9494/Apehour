import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Richiesta di call dal form "Ho un locale". Endpoint pubblico (il locale può
// non avere ancora confermato l'email): salva la richiesta con la service role
// key e avvisa via mail. Un errore di invio mail non blocca la richiesta, che
// resta comunque salvata in tabella.

const NOTIFY_TO = process.env.CALL_REQUEST_NOTIFY_TO ?? "info@apehour.it";
const MAIL_FROM = process.env.MAIL_FROM ?? "ApeHour <noreply@apehour.it>";

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : null;
}

function esc(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Troppe richieste, riprova tra qualche minuto." }, { status: 429 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Servizio non configurato" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const contactName = str(body.contactName, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const venueName = str(body.venueName, 160);
  const slotDate = str(body.slotDate, 10);
  const slotTime = str(body.slotTime, 5);
  const address = str(body.address, 250);
  const city = str(body.city, 80);
  const avgSpend = str(body.avgSpend, 40);
  const eventSource = str(body.eventSource, 80);

  if (
    !contactName || !email || !phone || !venueName || !slotDate || !slotTime ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(slotDate) ||
    !/^\d{2}:\d{2}$/.test(slotTime)
  ) {
    return NextResponse.json({ error: "Dati mancanti o non validi" }, { status: 400 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.from("call_requests").insert({
    contact_name: contactName,
    email,
    phone,
    venue_name: venueName,
    address,
    city,
    avg_spend: avgSpend,
    slot_date: slotDate,
    slot_time: slotTime,
    event_source: eventSource,
  });
  if (error) {
    console.error("call_requests insert failed:", error.message);
    return NextResponse.json({ error: "Impossibile salvare la richiesta" }, { status: 500 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const [y, m, d] = slotDate.split("-");
    const rows: [string, string][] = [
      ["Locale", venueName],
      ["Referente", contactName],
      ["Telefono", phone],
      ["Email", email],
      ["Indirizzo", [address, city].filter(Boolean).join(", ") || "-"],
      ["Conto medio", avgSpend ?? "-"],
      ["Provenienza", eventSource ?? "-"],
    ];
    const html =
      `<h2>Nuova richiesta di call: ${esc(d)}/${esc(m)}/${esc(y)} alle ${esc(slotTime)}</h2>` +
      `<table cellpadding="6" style="border-collapse:collapse">` +
      rows.map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`).join("") +
      `</table>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: [NOTIFY_TO],
          reply_to: email,
          subject: `Call ${d}/${m} ${slotTime} - ${venueName}`,
          html,
        }),
      });
      if (!res.ok) console.error("Resend error:", res.status, await res.text());
    } catch (e) {
      console.error("Resend request failed:", e);
    }
  } else {
    console.error("RESEND_API_KEY mancante: richiesta salvata ma nessuna mail inviata");
  }

  return NextResponse.json({ ok: true });
}
