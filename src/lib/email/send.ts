// Invio email transazionali tramite Resend (conferme, notifiche di sistema —
// non le email di auth, quelle le gestisce Supabase/SMTP con i suoi template).
// Se RESEND_API_KEY manca, non blocca mai l'operazione principale: logga e basta.

const MAIL_FROM = process.env.MAIL_FROM ?? "ApeHour <noreply@apehour.it>";

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error(`RESEND_API_KEY mancante: email "${params.subject}" a ${params.to} non inviata`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [params.to],
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) console.error("Resend error:", res.status, await res.text());
  } catch (e) {
    console.error("Resend request failed:", e);
  }
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Stesso involucro visivo usato nel template "Confirm signup" di Supabase,
// per coerenza con le email che il sistema manda già oggi.
export function emailShell(opts: { heading: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html><body style="margin:0; padding:0; background-color:#FAFAF7; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAF7; padding: 32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
<tr><td align="center" style="background-color:#17160F; padding: 32px 24px;">
<img src="https://apehour.it/apeapplogo-email.png" alt="ApeHour" width="96" height="96" style="display:block; border-radius:20px;" />
</td></tr>
<tr><td style="padding: 32px 32px 8px 32px;">
<h1 style="margin:0 0 8px 0; font-size:22px; color:#1A1915;">${escapeHtml(opts.heading)}</h1>
${opts.bodyHtml}
</td></tr>
<tr><td style="padding: 20px 32px; background-color:#F4F3EF; border-top:1px solid #ECEAE4;">
<p style="margin:0; font-size:12px; color:#AAAA9A; text-align:center;">© ApeHour</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export { escapeHtml };
