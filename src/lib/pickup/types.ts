// ─────────────────────────────────────────────────────────────────────────────
//  Pickup order domain types ("buzzer virtuale")
// ─────────────────────────────────────────────────────────────────────────────

export type PickupOrderStatus = "richiesto" | "pronto" | "ritirato" | "annullato";

export interface ClientPickupOrder {
  id: string;
  orderRef: string;                  // es. APE-ORD-000042

  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  customerId: string | null;

  customerName: string;
  customerPhone: string;
  itemDescription: string;
  status: PickupOrderStatus;

  requestedAt: string;
  readyAt?: string;
  pickedUpAt?: string;
  updatedAt: string;
}

export type MerchantPickupOrderView = ClientPickupOrder;
