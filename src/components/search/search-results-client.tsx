"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RestaurantCard } from "@/components/restaurant-card";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { getRestaurantsClient } from "@/lib/services/restaurants";
import type { Cuisine, PriceRange, Restaurant, SearchFilters } from "@/lib/types";

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), { ssr: false });

const CATEGORY_ICONS: Array<{ label: string; emoji: string; value: Cuisine | "All" }> = [
  { label: "Tutti",         emoji: "🎉", value: "All" },
  { label: "Spritz",        emoji: "🍹", value: "Spritz Bar" },
  { label: "Cocktail",      emoji: "🍸", value: "Cocktail Bar" },
  { label: "Wine Bar",      emoji: "🍷", value: "Wine Bar" },
  { label: "Brunch",        emoji: "☕", value: "Brunch" },
  { label: "Vermouth",      emoji: "🫙", value: "Vermouth Bar" },
  { label: "Negroni",       emoji: "🍋", value: "Negroni Bar" },
  { label: "Cicchetti",     emoji: "🍢", value: "Cicchetti Bar" },
  { label: "Champagne",     emoji: "🥂", value: "Champagne Bar" },
  { label: "Rooftop",       emoji: "🌅", value: "Rooftop Bar" },
  { label: "Beer Bar",      emoji: "🍺", value: "Beer Bar" },
  { label: "Whisky Bar",    emoji: "🥃", value: "Whisky Bar" },
];

const PRICE_RANGES: Array<PriceRange | "All"> = ["All", "$$", "$$$", "$$$$"];
const PRICE_LABEL: Record<string, string> = {
  All: "Tutti i budget",
  "$$": "€€ Moderato",
  "$$$": "€€€ Medio-alto",
  "$$$$": "€€€€ Premium",
};

const GUESTS_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

type ExtendedFilters = SearchFilters & { priceRange?: PriceRange | "All" };

export function SearchResultsClient({ initialFilters }: { initialFilters: SearchFilters }) {
  const [filters, setFilters] = useState<ExtendedFilters>({
    ...initialFilters,
    priceRange: "All",
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    let active = true;
    setLoading(true);

    getRestaurantsClient(filters)
      .then((items) => {
        if (!active) return;
        const filtered =
          filters.priceRange && filters.priceRange !== "All"
            ? items.filter((r) => r.priceRange === filters.priceRange)
            : items;
        setRestaurants(filtered);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [filters]);

  function setFilter<K extends keyof ExtendedFilters>(key: K, value: ExtendedFilters[K]) {
    setLoading(true);
    setError(null);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  if (error) {
    return (
      <ErrorState
        copy={error}
        onRetry={() => { setLoading(true); setError(null); setFilters({ ...filters }); }}
      />
    );
  }

  const filterControls = (
    <>
      <label className="search-sidebar__field">
        <span>Budget</span>
        <select
          value={filters.priceRange ?? "All"}
          onChange={(e) => setFilter("priceRange", e.target.value as PriceRange | "All")}
        >
          {PRICE_RANGES.map((p) => (
            <option key={p} value={p}>{PRICE_LABEL[p]}</option>
          ))}
        </select>
      </label>

      <label className="search-sidebar__field">
        <span>Persone</span>
        <select
          value={filters.guests ?? 2}
          onChange={(e) => setFilter("guests", Number(e.target.value))}
        >
          {GUESTS_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "persona" : "persone"}</option>
          ))}
        </select>
      </label>

      <label className="search-sidebar__field">
        <span>Data</span>
        <input
          type="date"
          value={filters.date ?? ""}
          onChange={(e) => setFilter("date", e.target.value)}
        />
      </label>

      <label className="search-sidebar__field">
        <span>Orario</span>
        <select
          value={filters.time ?? ""}
          onChange={(e) => setFilter("time", e.target.value)}
        >
          <option value="">Qualsiasi ora</option>
          {["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="search-sidebar__field">
        <span>Città</span>
        <input
          type="text"
          placeholder="Milano, Roma, Torino…"
          value={filters.city ?? ""}
          onChange={(e) => setFilter("city", e.target.value || undefined)}
        />
      </label>
    </>
  );

  return (
    <div className="search-page">
      {/* ── Category icon strip ─────────────────────── */}
      <div className="search-category-strip">
        <div className="search-category-strip__scroll">
          {CATEGORY_ICONS.map((cat) => {
            const active = (filters.cuisine ?? "All") === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                className={`search-cat-item${active ? " is-active" : ""}`}
                onClick={() => setFilter("cuisine", cat.value === "All" ? undefined : cat.value as Cuisine)}
              >
                <span className="search-cat-item__icon">{cat.emoji}</span>
                <span className="search-cat-item__label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile filter trigger bar ───────────────── */}
      <div className="mobile-results-bar">
        <span className="mobile-results-bar__count">
          {loading ? "…" : `${restaurants.length} locali`}
        </span>
        <div className="search-view-toggle">
          <button
            type="button"
            className={`search-view-toggle__btn${viewMode === "list" ? " is-active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            ☰ Lista
          </button>
          <button
            type="button"
            className={`search-view-toggle__btn${viewMode === "map" ? " is-active" : ""}`}
            onClick={() => setViewMode("map")}
          >
            ◎ Mappa
          </button>
        </div>
        <button
          className="mobile-filter-trigger"
          type="button"
          onClick={() => setFiltersOpen(true)}
        >
          Filtri
        </button>
      </div>

      {/* ── Body: sidebar + results ─────────────────── */}
      <div className="search-body">
        <aside className="search-sidebar">
          <p className="search-sidebar__label">Filtri</p>

          <div className="search-sidebar__group">
            {filterControls}
          </div>

          <div className="search-sidebar__stat">
            <strong>{loading ? "…" : restaurants.length}</strong>
            <span>locali trovati</span>
          </div>

          <button
            type="button"
            className="search-sidebar__reset"
            onClick={() => setFilters({ priceRange: "All" })}
          >
            Azzera filtri
          </button>
        </aside>

        {/* ── Results ───────────────────────────────── */}
        <div className="search-results">
          {loading && <SkeletonGrid />}

          {!loading && restaurants.length === 0 && (
            <div className="search-empty">
              <p className="search-empty__icon">🍋</p>
              <h2>Nessun locale trovato</h2>
              <p>Prova a rimuovere qualche filtro o cerca in un&apos;altra città.</p>
            </div>
          )}

          {!loading && restaurants.length > 0 && viewMode === "list" && (
            <div className="search-grid">
              {restaurants.map((restaurant, i) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} priority={i < 3} />
              ))}
            </div>
          )}

          {!loading && restaurants.length > 0 && viewMode === "map" && (
            <div className="search-map-wrap">
              <LeafletMap
                key={restaurants.map((r) => r.id).join(",")}
                center={restaurants[0].coordinates}
                zoom={13}
                markers={restaurants.map((r) => ({
                  lat: r.coordinates.lat,
                  lng: r.coordinates.lng,
                  label: r.priceRange,
                  popupHtml: `<a href="/restaurants/${r.slug}" style="font-weight:800;font-size:0.92rem;color:#222;display:block;margin-bottom:2px">${r.name}</a><span style="font-size:0.76rem;color:#888">${r.cuisine}</span><br/><a href="/restaurants/${r.slug}" style="font-size:0.78rem;color:#F58200;font-weight:700;margin-top:6px;display:inline-block">Prenota →</a>`,
                }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter bottom sheet ──────────────── */}
      {filtersOpen && (
        <>
          <div
            className="mobile-filter-backdrop"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="mobile-filter-sheet">
            <div className="mobile-filter-sheet__handle" />
            <div className="mobile-filter-sheet__header">
              <h3>Filtri</h3>
              <button
                type="button"
                className="mobile-filter-sheet__close"
                onClick={() => setFiltersOpen(false)}
                aria-label="Chiudi filtri"
              >
                ✕
              </button>
            </div>
            <div className="mobile-filter-sheet__body">
              <div className="search-sidebar__group">
                {filterControls}
              </div>
            </div>
            <div className="mobile-filter-sheet__footer">
              <button
                type="button"
                className="mobile-filter-sheet__reset"
                onClick={() => setFilters({ priceRange: "All" })}
              >
                Azzera
              </button>
              <button
                type="button"
                className="mobile-filter-sheet__apply"
                onClick={() => setFiltersOpen(false)}
              >
                Mostra {loading ? "…" : restaurants.length} locali
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
