// ─────────────────────────────────────────────────────────────────────────────
//  Pickup order service — Supabase (tabella public.pickup_orders)
//  "Buzzer virtuale": il cliente ordina da remoto, il locale segna quando è
//  pronto, il cliente lo ritira di persona (si paga lì, nessun pagamento online).
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/client";
import type { ClientPickupOrder, MerchantPickupOrderView, PickupOrderStatus } from "./types";

interface PickupOrderRow {
  id: string;
  order_ref: string;
  restaurant_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  item_description: string;
  status: PickupOrderStatus;
  requested_at: string;
  ready_at: string | null;
  picked_up_at: string | null;
  updated_at: string;
}

// Stesso motivo di attachRestaurants in bookings/service.ts: restaurants non
// ha una policy SELECT pubblica, va letto da restaurants_public.
async function attachRestaurants(rows: PickupOrderRow[]): Promise<Map<string, { name: string; slug: string }>> {
  const restaurantIds = [...new Set(rows.map((r) => r.restaurant_id))];
  if (restaurantIds.length === 0) return new Map();
  const supabase = createClient();
  const { data, error } = await supabase.from("restaurants_public").select("id, name, slug").in("id", restaurantIds);
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((r) => [r.id as string, { name: r.name as string, slug: r.slug as string }]));
}

function mapRow(row: PickupOrderRow, restaurant?: { name: string; slug: string }): ClientPickupOrder {
  return {
    id: row.id,
    orderRef: row.order_ref,
    restaurantId: row.restaurant_id,
    restaurantName: restaurant?.name ?? "",
    restaurantSlug: restaurant?.slug ?? "",
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone ?? "",
    itemDescription: row.item_description,
    status: row.status,
    requestedAt: row.requested_at,
    readyAt: row.ready_at ?? undefined,
    pickedUpAt: row.picked_up_at ?? undefined,
    updatedAt: row.updated_at,
  };
}

export async function createPickupOrder(input: {
  restaurantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
}): Promise<ClientPickupOrder> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pickup_orders")
    .insert({
      restaurant_id: input.restaurantId,
      customer_id: input.customerId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      item_description: input.itemDescription,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as unknown as PickupOrderRow;
  const restaurants = await attachRestaurants([row]);
  return mapRow(row, restaurants.get(row.restaurant_id));
}

export async function fetchClientPickupOrders(customerId: string): Promise<ClientPickupOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("requested_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as PickupOrderRow[];
  const restaurants = await attachRestaurants(rows);
  return rows.map((r) => mapRow(r, restaurants.get(r.restaurant_id)));
}

export async function cancelPickupOrder(orderId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pickup_orders")
    .update({ status: "annullato" })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function fetchMerchantPickupOrders(restaurantId: string): Promise<MerchantPickupOrderView[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("requested_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as PickupOrderRow[];
  return rows.map((r) => mapRow(r, { name: "", slug: "" }));
}

export async function markPickupOrderReady(orderId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pickup_orders")
    .update({ status: "pronto", ready_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function markPickupOrderPickedUp(orderId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pickup_orders")
    .update({ status: "ritirato", picked_up_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}
