import { Suspense } from "react";
import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";
import { SkeletonGrid } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Booking Checkout",
  description: "Complete a fast restaurant reservation with date, time, guests, details, and confirmation.",
};

export default function BookingPage() {
  return (
    <div className="route-shell">
      <Suspense fallback={<SkeletonGrid count={3} />}>
        <BookingFlow />
      </Suspense>
    </div>
  );
}
