import type { Metadata } from "next";
import { ClientBookings } from "@/components/booking/client-bookings";

export const metadata: Metadata = {
  title: "Le mie prenotazioni | ApeHour",
};

export default function ProfileBookingsPage() {
  return <ClientBookings />;
}
