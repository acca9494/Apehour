// ─────────────────────────────────────────────────────────────────────────────
//  Booking domain types
//  Separati da lib/types.ts (tipi UI generici) per mantenere la logica pulita.
// ─────────────────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"     // creata, in attesa di conferma
  | "confirmed"   // confermata dal sistema o commerciante
  | "cancelled"   // annullata (cliente o commerciante)
  | "completed"   // visita avvenuta
  | "no_show";    // cliente non si è presentato

export interface ClientBooking {
  id: string;
  bookingRef: string;                // es. APE-2024-00042

  // Riferimenti
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantCity: string;
  customerId: string;

  // Dettagli
  date: string;                      // YYYY-MM-DD
  time: string;                      // HH:MM
  guests: number;
  status: BookingStatus;

  // Snapshot cliente al momento della prenotazione
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;

  // Caparra
  depositRequired: boolean;
  depositAmount?: number;
  depositPaid: boolean;

  // Timestamp
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// Dati del form (step 1 + step 2)
export interface BookingFormData {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantCity: string;
  date: string;
  time: string;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
}

// Risultato del controllo disponibilità
export interface AvailabilityResult {
  available: boolean;
  availableSeats: number;
  totalSeats: number;
  reason?: string;               // motivo se non disponibile
}

// Vista prenotazione per il commerciante (include più dettagli)
export type MerchantBookingView = ClientBooking;

// Aggiornamento di stato da parte del commerciante
export type StatusUpdate = {
  status: BookingStatus;
  reason?: string;
};
