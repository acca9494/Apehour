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

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['‘’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
