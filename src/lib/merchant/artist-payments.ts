// ─────────────────────────────────────────────────────────────────────────────
//  Pagamenti effettuati dal locale agli artisti (mock — sostituire con backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface ArtistPayment {
  id: string;
  artistName: string;
  eventTitle: string;
  amount: number;
  date: string;
  status: "Pagato" | "In attesa";
}

function key(userId: string) { return `appape_merchant_artist_payments_${userId}`; }

const DEFAULT_PAYMENTS: ArtistPayment[] = [
  { id: "pay-1", artistName: "Giulia Ferri", eventTitle: "Cercasi DJ per aperitivo del venerdì", amount: 150, date: "6 Giu 2026", status: "Pagato" },
  { id: "pay-2", artistName: "Andrea Ricci",  eventTitle: "Animazione serata a tema anni '80",     amount: 155, date: "22 Giu 2026", status: "In attesa" },
];

export function getArtistPayments(userId: string): ArtistPayment[] {
  try {
    const raw = localStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as ArtistPayment[]) : DEFAULT_PAYMENTS;
  } catch {
    return DEFAULT_PAYMENTS;
  }
}
