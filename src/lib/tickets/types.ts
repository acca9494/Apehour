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

  purchasedAt: string;
  status: "confirmed" | "cancelled";
}

export interface TicketPurchaseFormData {
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  restaurantSlug: string;
  restaurantName: string;
  quantity: number;
  unitPrice: number;
  isFree: boolean;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}
