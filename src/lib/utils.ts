export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatReviewCount(count: number): string {
  return new Intl.NumberFormat("en", {
    notation: count > 999 ? "compact" : "standard",
  }).format(count);
}

export function todayInputValue(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}
