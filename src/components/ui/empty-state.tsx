import { ClayLink } from "@/components/ui/clay-button";

type EmptyStateProps = {
  title: string;
  copy: string;
  actionLabel?: string;
  href?: string;
};

export function EmptyState({ title, copy, actionLabel = "Explore restaurants", href = "/search" }: EmptyStateProps) {
  return (
    <section className="state-panel">
      <p className="eyebrow">Nothing here yet</p>
      <h1>{title}</h1>
      <p>{copy}</p>
      <ClayLink href={href}>{actionLabel}</ClayLink>
    </section>
  );
}
