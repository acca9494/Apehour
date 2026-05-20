"use client";

import { ClayButton, ClayLink } from "@/components/ui/clay-button";

type ErrorStateProps = {
  title?: string;
  copy?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something interrupted the booking flow",
  copy = "Refresh the results and we will try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="state-panel state-panel--error" role="alert">
      <p className="eyebrow">Service note</p>
      <h1>{title}</h1>
      <p>{copy}</p>
      <div className="state-panel__actions">
        {onRetry ? <ClayButton onClick={onRetry}>Try again</ClayButton> : null}
        <ClayLink href="/search" variant="secondary">
          Back to search
        </ClayLink>
      </div>
    </section>
  );
}
