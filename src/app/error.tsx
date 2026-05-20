"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="route-shell state-route">
      <ErrorState onRetry={reset} />
    </div>
  );
}
