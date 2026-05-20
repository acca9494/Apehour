import type { Metadata } from "next";
import { MerchantBookings } from "@/components/dashboard/merchant-bookings";

export const metadata: Metadata = {
  title: "Prenotazioni | Dashboard ApeTable",
};

export default function MerchantBookingsPage() {
  return <MerchantBookings />;
}
