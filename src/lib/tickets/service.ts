import { addTicket } from "./store";
import type { EventTicket, TicketPurchaseFormData } from "./types";

function simulateLatency(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function generateId() {
  return `tix-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateRef() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `APE-TIX-${n}`;
}

export async function purchaseTicket(formData: TicketPurchaseFormData, buyerId: string): Promise<EventTicket> {
  await simulateLatency();

  const totalPrice = formData.isFree ? 0 : formData.unitPrice * formData.quantity;
  const now = new Date().toISOString();

  const ticket: EventTicket = {
    id: generateId(),
    ticketRef: generateRef(),
    eventSlug: formData.eventSlug,
    eventTitle: formData.eventTitle,
    eventDate: formData.eventDate,
    eventLocation: formData.eventLocation,
    restaurantSlug: formData.restaurantSlug,
    restaurantName: formData.restaurantName,
    buyerId,
    buyerName: formData.buyerName,
    buyerEmail: formData.buyerEmail,
    buyerPhone: formData.buyerPhone,
    quantity: formData.quantity,
    unitPrice: formData.unitPrice,
    totalPrice,
    isFree: formData.isFree,
    purchasedAt: now,
    status: "confirmed",
  };

  addTicket(ticket);
  return ticket;
}

export function parsePrice(priceLabel: string): { unitPrice: number; isFree: boolean } {
  if (/free/i.test(priceLabel)) return { unitPrice: 0, isFree: true };
  const match = priceLabel.match(/(\d+(?:[.,]\d+)?)/);
  return { unitPrice: match ? Number(match[1]!.replace(",", ".")) : 0, isFree: false };
}
