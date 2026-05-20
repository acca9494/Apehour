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

function tablesKey(uid: string)       { return `appape_merchant_tables_${uid}`; }
function availabilityKey(uid: string) { return `appape_merchant_availability_${uid}`; }
function settingsKey(uid: string)     { return `appape_merchant_settings_${uid}`; }

// ── Default data (demo account: Spritz Brera rst-001) ───────────────────────

const DEFAULT_TABLES: MerchantTable[] = [
  { id: "tbl-001", name: "Tavolo 1", capacity: 2, zone: "Interno", status: "active" },
  { id: "tbl-002", name: "Tavolo 2", capacity: 2, zone: "Interno", status: "active" },
  { id: "tbl-003", name: "Tavolo 3", capacity: 4, zone: "Interno", status: "active" },
  { id: "tbl-004", name: "Tavolo 4", capacity: 4, zone: "Interno", status: "active" },
  { id: "tbl-005", name: "Terrazza A", capacity: 4, zone: "Terrazza", status: "active" },
  { id: "tbl-006", name: "Terrazza B", capacity: 6, zone: "Terrazza", status: "active" },
  { id: "tbl-007", name: "Bancone 1", capacity: 2, zone: "Bancone", status: "active" },
  { id: "tbl-008", name: "Bancone 2", capacity: 2, zone: "Bancone", status: "inactive" },
];

const DEFAULT_AVAILABILITY: DayConfig[] = [
  {
    day: "lun", label: "Lunedì", open: true,
    slots: [
      { id: "s-lun-1", time: "17:30", label: "Early Bird", totalSeats: 12, discount: 20, active: true },
      { id: "s-lun-2", time: "18:30", label: "Aperitivo", totalSeats: 20, active: true },
      { id: "s-lun-3", time: "19:30", label: "Happy Hour", totalSeats: 20, active: true },
    ],
  },
  {
    day: "mar", label: "Martedì", open: true,
    slots: [
      { id: "s-mar-1", time: "17:30", label: "Early Bird", totalSeats: 12, discount: 20, active: true },
      { id: "s-mar-2", time: "18:30", label: "Aperitivo", totalSeats: 20, active: true },
      { id: "s-mar-3", time: "19:30", label: "Happy Hour", totalSeats: 20, active: true },
    ],
  },
  {
    day: "mer", label: "Mercoledì", open: true,
    slots: [
      { id: "s-mer-1", time: "17:30", label: "Early Bird", totalSeats: 12, discount: 20, active: true },
      { id: "s-mer-2", time: "18:30", label: "Aperitivo", totalSeats: 20, active: true },
      { id: "s-mer-3", time: "19:30", label: "Happy Hour", totalSeats: 20, active: true },
    ],
  },
  {
    day: "gio", label: "Giovedì", open: true,
    slots: [
      { id: "s-gio-1", time: "17:30", label: "Early Bird", totalSeats: 12, discount: 20, active: true },
      { id: "s-gio-2", time: "18:30", label: "Aperitivo", totalSeats: 24, active: true },
      { id: "s-gio-3", time: "19:30", label: "Happy Hour", totalSeats: 24, active: true },
      { id: "s-gio-4", time: "20:30", label: "Serata", totalSeats: 16, active: true },
    ],
  },
  {
    day: "ven", label: "Venerdì", open: true,
    slots: [
      { id: "s-ven-1", time: "17:30", label: "Early Bird", totalSeats: 14, discount: 15, active: true },
      { id: "s-ven-2", time: "18:30", label: "Aperitivo", totalSeats: 28, active: true },
      { id: "s-ven-3", time: "19:30", label: "Happy Hour", totalSeats: 28, active: true },
      { id: "s-ven-4", time: "20:30", label: "Serata", totalSeats: 20, active: true },
    ],
  },
  {
    day: "sab", label: "Sabato", open: true,
    slots: [
      { id: "s-sab-1", time: "12:00", label: "Pranzo", totalSeats: 20, active: true },
      { id: "s-sab-2", time: "17:30", label: "Early Bird", totalSeats: 14, discount: 10, active: true },
      { id: "s-sab-3", time: "18:30", label: "Aperitivo", totalSeats: 30, active: true },
      { id: "s-sab-4", time: "19:30", label: "Happy Hour", totalSeats: 30, active: true },
      { id: "s-sab-5", time: "20:30", label: "Serata", totalSeats: 24, active: true },
    ],
  },
  {
    day: "dom", label: "Domenica", open: false,
    slots: [
      { id: "s-dom-1", time: "12:00", label: "Pranzo", totalSeats: 20, active: false },
      { id: "s-dom-2", time: "18:30", label: "Aperitivo", totalSeats: 20, active: false },
    ],
  },
];

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

// ── Tables CRUD ──────────────────────────────────────────────────────────────

export function getTables(userId: string): MerchantTable[] {
  try {
    const raw = localStorage.getItem(tablesKey(userId));
    return raw ? (JSON.parse(raw) as MerchantTable[]) : DEFAULT_TABLES;
  } catch {
    return DEFAULT_TABLES;
  }
}

export function saveTables(tables: MerchantTable[], userId: string): void {
  localStorage.setItem(tablesKey(userId), JSON.stringify(tables));
}

export function upsertTable(table: MerchantTable, userId: string): void {
  const all = getTables(userId);
  const idx = all.findIndex((t) => t.id === table.id);
  if (idx === -1) all.push(table);
  else all[idx] = table;
  saveTables(all, userId);
}

export function deleteTable(id: string, userId: string): void {
  saveTables(getTables(userId).filter((t) => t.id !== id), userId);
}

// ── Availability CRUD ────────────────────────────────────────────────────────

export function getAvailability(userId: string): DayConfig[] {
  try {
    const raw = localStorage.getItem(availabilityKey(userId));
    return raw ? (JSON.parse(raw) as DayConfig[]) : DEFAULT_AVAILABILITY;
  } catch {
    return DEFAULT_AVAILABILITY;
  }
}

export function saveAvailability(config: DayConfig[], userId: string): void {
  localStorage.setItem(availabilityKey(userId), JSON.stringify(config));
}

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
