export function SkeletonCard() {
  return (
    <article className="restaurant-card skeleton-card" aria-label="Loading restaurant">
      <div className="skeleton skeleton-image" />
      <div className="restaurant-card__body">
        <div className="skeleton skeleton-line skeleton-line--wide" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line--short" />
        <div className="skeleton-row">
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-pill" />
        </div>
      </div>
    </article>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="restaurant-grid" aria-live="polite" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </div>
  );
}
