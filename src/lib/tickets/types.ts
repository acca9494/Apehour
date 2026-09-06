export type TicketMode = "paid" | "free" | "waitlist";

export interface EventTicket {
  id: string;
  ticketRef: string;

  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  restaurantSlug: string;
  restaurantName: string;

  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;

  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isFree: boolean;
  mode: TicketMode;

  purchasedAt: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface TicketPurchaseFormData {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  restaurantSlug: string;
  restaurantName: string;
  quantity: number;
  unitPrice: number;
  isFree: boolean;
  mode: TicketMode;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}
