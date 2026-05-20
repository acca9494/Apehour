import type { BookingConfirmation, BookingRequest } from "@/lib/types";
import { mockFetch } from "@/lib/services/http";

export async function createBooking(request: BookingRequest): Promise<BookingConfirmation> {
  const confirmation = {
    confirmationId: `APE-${request.restaurantId.slice(-3).toUpperCase()}-${Date.now().toString().slice(-5)}`,
    status: "confirmed" as const,
    message: `Your table for ${request.guests} is confirmed at ${request.time}.`,
  };

  return mockFetch(confirmation, { latency: 520 });
}
