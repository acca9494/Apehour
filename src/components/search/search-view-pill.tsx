"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchViewPill() {
  const pathname    = usePathname();
  const router      = useRouter();
  const searchParams = useSearchParams();

  if (pathname !== "/search") return null;

  const view = searchParams.get("view") ?? "list";

  function switchTo(mode: "list" | "map") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="search-view-pill" role="group" aria-label="Vista">
      <button
        type="button"
        className={`search-view-pill__btn${view === "list" ? " is-active" : ""}`}
        onClick={() => switchTo("list")}
      >
        Lista
      </button>
      <button
        type="button"
        className={`search-view-pill__btn${view === "map" ? " is-active" : ""}`}
        onClick={() => switchTo("map")}
      >
        Mappa
      </button>
    </div>
  );
}
