// ─────────────────────────────────────────────────────────────────────────────
//  Merchant localStorage store (mock — sostituire con Supabase)
//  Gestisce: config locale, tavoli, disponibilità override, impostazioni caparra
// ─────────────────────────────────────────────────────────────────────────────

export type TableStatus = "active" | "inactive";

export interface MerchantTable {
  id: string;
  name: string;      // es. "Tavolo 1", "Terrazza A"
  capacity: number;
  zone: string;      // es. "Interno", "Esterno", "Terrazza"
  status: TableStatus;
  x: number;         // posizione libera in sala, px
  y: number;
  width: number;     // dimensione libera, px
  height: number;
}

export type DayKey = "lun" | "mar" | "mer" | "gio" | "ven" | "sab" | "dom";

export interface SlotConfig {
  id: string;
  time: string;
  label: string;
  totalSeats: number;
  discount?: number;
  active: boolean;
}

export interface DayConfig {
  day: DayKey;
  label: string;
  open: boolean;
  slots: SlotConfig[];
}

export interface DepositSettings {
  required: boolean;
  amount: number;        // in euro
  perPerson: boolean;    // true = per persona, false = fisso
  policy: string;
}

export type ApeType = "vespa-sprint" | "ape-plus" | "bombo-queen";

export interface MerchantOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  apeType?: ApeType;
  slotIds: string[]; // id degli slot di disponibilità a cui si applica l'offerta
}

export interface VenueSettings {
  restaurantId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  instagram?: string;
  heroImage: string;
  deposit: DepositSettings;
}

// ── Keys localStorage ────────────────────────────────────────────────────────

function settingsKey(uid: string)     { return `appape_merchant_settings_${uid}`; }

// ── Default data (demo account: Spritz Brera rst-001) ───────────────────────

const DEFAULT_SETTINGS: VenueSettings = {
  restaurantId: "rst-001",
  name: "Spritz Brera",
  description:
    "Il punto di riferimento per l'aperitivo nel cuore di Brera. Spritz artigianali, cicchetti d'autore e lista di vini naturali.",
  address: "Via Solferino 22, Milano",
  city: "Milano",
  phone: "+39 02 1234567",
  email: "info@spritzbrera.it",
  website: "https://spritzbrera.it",
  instagram: "@spritzbrera",
  heroImage:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
  deposit: {
    required: false,
    amount: 5,
    perPerson: true,
    policy: "La caparra viene trattenuta in caso di no-show senza preavviso.",
  },
};

// ── Venue Settings ───────────────────────────────────────────────────────────

export function getVenueSettings(userId: string): VenueSettings {
  try {
    const raw = localStorage.getItem(settingsKey(userId));
    return raw ? (JSON.parse(raw) as VenueSettings) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveVenueSettings(settings: VenueSettings, userId: string): void {
  localStorage.setItem(settingsKey(userId), JSON.stringify(settings));
}
