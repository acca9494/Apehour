import type { Metadata } from "next";
import { ClientPickupOrders } from "@/components/pickup/client-pickup-orders";

export const metadata: Metadata = {
  title: "I miei ordini | ApeHour",
};

export default function ProfileOrdiniPage() {
  return <ClientPickupOrders />;
}
