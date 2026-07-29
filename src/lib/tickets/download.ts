import type { EventTicket } from "./types";

export function downloadTicket(ticket: EventTicket): void {
  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<title>Biglietto ${ticket.ticketRef}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f3ef; margin: 0; padding: 2rem; }
  .ticket { max-width: 420px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); border: 1.5px solid #e5e3dc; }
  .ticket__header { background: #17160f; color: #fff; padding: 1.5rem; }
  .ticket__eyebrow { color: #f5a800; font-weight: 800; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.35rem; }
  .ticket__title { font-size: 1.3rem; font-weight: 800; margin: 0; }
  .ticket__body { padding: 1.5rem; }
  .ticket__row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #e5e3dc; font-size: 0.9rem; }
  .ticket__row:last-child { border-bottom: none; }
  .ticket__row span:first-child { color: #8a8778; }
  .ticket__row span:last-child { font-weight: 700; color: #17160f; }
  .ticket__ref { text-align: center; padding: 1.25rem; font-size: 1.1rem; font-weight: 900; letter-spacing: 0.08em; background: #f4f3ef; }
  .ticket__footer { text-align: center; padding: 1rem 1.5rem 1.5rem; color: #8a8778; font-size: 0.78rem; }
  @media print { body { background: #fff; padding: 0; } .ticket { box-shadow: none; border: none; } }
</style>
</head>
<body>
  <div class="ticket">
    <div class="ticket__header">
      <p class="ticket__eyebrow">ApeHour · Biglietto evento</p>
      <h1 class="ticket__title">${ticket.eventTitle}</h1>
    </div>
    <div class="ticket__ref">${ticket.ticketRef}</div>
    <div class="ticket__body">
      <div class="ticket__row"><span>Data e ora</span><span>${ticket.eventDate}</span></div>
      <div class="ticket__row"><span>Locale</span><span>${ticket.restaurantName}</span></div>
      <div class="ticket__row"><span>Luogo</span><span>${ticket.eventLocation}</span></div>
      <div class="ticket__row"><span>Intestatario</span><span>${ticket.buyerName}</span></div>
      <div class="ticket__row"><span>Biglietti</span><span>${ticket.quantity}</span></div>
      <div class="ticket__row"><span>Totale</span><span>${ticket.isFree ? "Free entry" : `€${ticket.totalPrice.toFixed(2)}`}</span></div>
    </div>
    <div class="ticket__footer">Presenta questo biglietto (anche su schermo) all'ingresso dell'evento.</div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    // Popup blocked — fall back to a direct file download
    const a = document.createElement("a");
    a.href = url;
    a.download = `biglietto-${ticket.ticketRef}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
