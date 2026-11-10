import type { Metadata } from "next";
import { MerchantPickupOrders } from "@/components/dashboard/merchant-pickup-orders";

export const metadata: Metadata = {
  title: "Ritiri | Dashboard ApeHour",
};

export default function MerchantPickupOrdersPage() {
  return <MerchantPickupOrders />;
}
