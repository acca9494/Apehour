"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { RestaurantCard } from "@/components/restaurant-card";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { getRestaurantsClient } from "@/lib/services/restaurants";
import type { Cuisine, FoodType, PriceRange, Restaurant, SearchFilters } from "@/lib/types";
import { CalendarDropdown } from "@/components/ui/calendar-dropdown";

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), { ssr: false });

const CATEGORY_ICONS: Array<{ label: string; emoji: string; value: Cuisine | "All" }> = [
  { label: "Tutti",     emoji: "🎉", value: "All" },
  { label: "Spritz",    emoji: "🍹", value: "Spritz Bar" },
  { label: "Cocktail",  emoji: "🍸", value: "Cocktail Bar" },
  { label: "Wine Bar",  emoji: "🍷", value: "Wine Bar" },
  { label: "Brunch",    emoji: "☕", value: "Brunch" },
  { label: "Rooftop",   emoji: "🌅", value: "Rooftop Bar" },
  { label: "Beer Bar",  emoji: "🍺", value: "Beer Bar" },
  { label: "Champagne", emoji: "🥂", value: "Champagne Bar" },
  { label: "Whisky Bar", emoji: "🥃", value: "Whisky Bar" },
];

const BUDGET_OPTIONS: Array<{ value: PriceRange | "All"; label: string; budget: string; imgSrc?: string }> = [
  { value: "All",  label: "Tutti",       budget: ""    },
  { value: "$$",   label: "Vespa Sprint", budget: "€",   imgSrc: "/vespa-v2.png" },
  { value: "$$$",  label: "Ape Plus",    budget: "€€",  imgSrc: "/plus-v2.png"  },
  { value: "$$$$", label: "Bombo Queen", budget: "€€€", imgSrc: "/bombo-v2.png" },
];

const GUESTS_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

const FOOD_TYPE_OPTIONS: Array<{ value: FoodType | "All"; label: string; emoji: string }> = [
  { value: "All",           label: "Tutti",          emoji: "🍽️" },
  { value: "Vegano",        label: "Vegano",          emoji: "🌱" },
  { value: "Vegetariano",   label: "Vegetariano",     emoji: "🥗" },
  { value: "Senza Glutine", label: "Senza Glutine",   emoji: "🌾" },
  { value: "Halal",         label: "Halal",           emoji: "☪️" },
  { value: "Bio",           label: "Bio",             emoji: "🍃" },
];

const CHARACTERISTIC_OPTIONS: Array<{ key: string; label: string; emoji: string; keywords: string[] }> = [
  { key: "petFriendly",    label: "Pet Friendly",         emoji: "🐾", keywords: ["pet", "cani"] },
  { key: "outdoor",        label: "Spazio all'aperto",    emoji: "🌿", keywords: ["outdoor", "aperto", "terrazza", "giardino"] },
  { key: "view",           label: "Vista panoramica",     emoji: "🌇", keywords: ["vista", "panoramica", "tramonto"] },
  { key: "romantic",       label: "Romantico",            emoji: "💕", keywords: ["romantico"] },
  { key: "groups",         label: "Ideale per gruppi",    emoji: "👥", keywords: ["gruppi", "studenti"] },
  { key: "naturalWine",    label: "Vini naturali",        emoji: "🍇", keywords: ["vini naturali"] },
  { key: "craftCocktails", label: "Cocktail artigianali", emoji: "🍸", keywords: ["cocktail artigianali", "cocktail classici"] },
];

const TIME_SLOTS = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const AFTER_SLOT = "After";
const AFTER_TIMES = ["22:30", "23:00", "23:30", "00:00", "00:30", "01:00", "01:30"];
const BRUNCH_SLOT = "Brunch";
const BRUNCH_TIMES = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

type ExtendedFilters = {
  city?: string;
  date?: string;
  guests?: number;
  cuisines: Cuisine[];
  priceRanges: PriceRange[];
  foodTypes: FoodType[];
  times: string[];
  characteristics: string[];
};

function togglePill<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Roma:      { lat: 41.894, lng: 12.482 },
  Ostia:     { lat: 41.732, lng: 12.286 },
  Fregene:   { lat: 41.828, lng: 12.201 },
  Ladispoli: { lat: 41.951, lng: 12.077 },
};

const LAZIO_CENTER = { lat: 41.894, lng: 12.482 };

export function SearchResultsClient({ initialFilters }: { initialFilters: SearchFilters }) {
  const todayISO = new Date().toISOString().split("T")[0]!;

  const [filters, setFilters] = useState<ExtendedFilters>({
    city: initialFilters.city,
    date: initialFilters.date ?? todayISO,
    guests: initialFilters.guests ?? 2,
    cuisines: [],
    priceRanges: initialFilters.priceRange && initialFilters.priceRange !== "All" ? [initialFilters.priceRange] : [],
    foodTypes: [],
    times: [],
    characteristics: [],
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localiOpen, setLocaliOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewMode = (searchParams.get("view") ?? "list") as "list" | "map";

  function switchView(mode: "list" | "map") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }

  // Toggle results dropdown when header Filtri button is tapped
  useEffect(() => {
    const handler = () => setResultsOpen((v) => !v);
    window.addEventListener("apehour:open-filters", handler);
    return () => window.removeEventListener("apehour:open-filters", handler);
  }, []);

  // Broadcast restaurant count to the header
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("apehour:restaurants-count", { detail: loading ? null : restaurants.length }));
  }, [restaurants.length, loading]);

  // Sync base filters when URL changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: initialFilters.city,
      date: initialFilters.date,
      guests: initialFilters.guests,
      priceRanges: initialFilters.priceRange && initialFilters.priceRange !== "All" ? [initialFilters.priceRange] : prev.priceRanges,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters.city, initialFilters.date, initialFilters.guests, initialFilters.priceRange]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getRestaurantsClient({ city: filters.city, date: filters.date, guests: filters.guests })
      .then((items) => {
        if (!active) return;
        let filtered = items;
        if (filters.cuisines.length > 0)
          filtered = filtered.filter((r) => filters.cuisines.includes(r.cuisine));
        if (filters.priceRanges.length > 0)
          filtered = filtered.filter((r) => filters.priceRanges.includes(r.priceRange));
        if (filters.foodTypes.length > 0)
          filtered = filtered.filter((r) => filters.foodTypes.some((ft) => r.tags.map((t) => t.toLowerCase()).includes(ft.toLowerCase())));
        if (filters.times.length > 0)
          filtered = filtered.filter((r) => r.slots.some((s) =>
            filters.times.includes(s.time) ||
            (filters.times.includes(AFTER_SLOT) && AFTER_TIMES.includes(s.time)) ||
            (filters.times.includes(BRUNCH_SLOT) && BRUNCH_TIMES.includes(s.time))
          ));
        if (filters.characteristics.length > 0)
          filtered = filtered.filter((r) => {
            const tags = r.tags.map((t) => t.toLowerCase());
            return filters.characteristics.every((key) => {
              const opt = CHARACTERISTIC_OPTIONS.find((o) => o.key === key);
              return opt ? tags.some((t) => opt.keywords.some((kw) => t.includes(kw))) : true;
            });
          });
        setRestaurants(filtered);
      })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [filters]);

  function setFilter<K extends keyof ExtendedFilters>(key: K, value: ExtendedFilters[K]) {
    setLoading(true);
    setError(null);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters((prev) => ({ city: prev.city, date: todayISO, guests: prev.guests, cuisines: [], priceRanges: [], foodTypes: [], times: [], characteristics: [] }));
  }

  if (error) {
    return (
      <ErrorState
        copy={error}
        onRetry={() => { setLoading(true); setError(null); setFilters({ ...filters }); }}
      />
    );
  };

  const filterControls = (
    <>
      {/* Data */}
      <div className="search-sidebar__field">
        <span>Data</span>
        <CalendarDropdown compact value={filters.date ?? ""} onChange={(v) => setFilter("date", v)} />
      </div>

      {/* Orario — multi-select pills */}
      <div className="search-sidebar__field">
        <span>Orario</span>
        <div className="search-filter-toggles">
          <button
            type="button"
            className={`search-filter-toggle${filters.times.includes(BRUNCH_SLOT) ? " is-active" : ""}`}
            onClick={() => setFilter("times", togglePill(filters.times, BRUNCH_SLOT))}
          >
            🥐 Brunch
          </button>
          {TIME_SLOTS.map((t) => (
            <button
              key={t}
              type="button"
              className={`search-filter-toggle${filters.times.includes(t) ? " is-active" : ""}`}
              onClick={() => setFilter("times", togglePill(filters.times, t))}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            className={`search-filter-toggle${filters.times.includes(AFTER_SLOT) ? " is-active" : ""}`}
            onClick={() => setFilter("times", togglePill(filters.times, AFTER_SLOT))}
          >
            🌙 After
          </button>
        </div>
      </div>

      {/* Budget — multi-select pills (mirrors strip above map) */}
      <div className="search-sidebar__field">
        <span>Budget</span>
        <div className="search-filter-toggles">
          {BUDGET_OPTIONS.filter((o) => o.value !== "All").map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`search-filter-toggle search-filter-toggle--budget${filters.priceRanges.includes(opt.value as PriceRange) ? " is-active" : ""}`}
              onClick={() => setFilter("priceRanges", togglePill(filters.priceRanges, opt.value as PriceRange))}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {opt.imgSrc && <img src={opt.imgSrc} alt="" className="search-filter-toggle__ape-img" />}
              <span>{opt.label}</span>
              <span className="search-filter-toggle__budget">{opt.budget}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Persone */}
      <label className="search-sidebar__field">
        <span>Persone</span>
        <select value={filters.guests ?? 2} onChange={(e) => setFilter("guests", Number(e.target.value))}>
          {GUESTS_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "persona" : "persone"}</option>
          ))}
        </select>
      </label>

      {/* Tipo di aperitivo — multi-select cuisine pills */}
      <div className="search-sidebar__field">
        <span>Tipo di aperitivo</span>
        <div className="search-filter-toggles">
          {CATEGORY_ICONS.filter((c) => c.value !== "All").map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`search-filter-toggle${filters.cuisines.includes(cat.value as Cuisine) ? " is-active" : ""}`}
              onClick={() => setFilter("cuisines", togglePill(filters.cuisines, cat.value as Cuisine))}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tipo di cibo — multi-select pills */}
      <div className="search-sidebar__field">
        <span>Tipo di cibo</span>
        <div className="search-filter-toggles">
          {FOOD_TYPE_OPTIONS.filter((o) => o.value !== "All").map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`search-filter-toggle${filters.foodTypes.includes(opt.value as FoodType) ? " is-active" : ""}`}
              onClick={() => setFilter("foodTypes", togglePill(filters.foodTypes, opt.value as FoodType))}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Caratteristiche */}
      <div className="search-sidebar__field">
        <span>Caratteristiche</span>
        <div className="search-filter-toggles">
          {CHARACTERISTIC_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`search-filter-toggle${filters.characteristics.includes(opt.key) ? " is-active" : ""}`}
              onClick={() => setFilter("characteristics", togglePill(filters.characteristics, opt.key))}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className={`search-page${viewMode === "map" ? " search-page--map" : ""}`}>

      {/* ── Body: sidebar + (map or results) ───────── */}
      <div className={`search-body${viewMode === "map" ? " search-body--map" : ""}`}>
        {/* Tablet-only Filtri toggle */}
        <button
          type="button"
          className="search-sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <svg viewBox="0 0 22 20" fill="currentColor" aria-hidden="true">
            <polygon points="5.5,0 9.5,0 11.5,3.46 9.5,6.93 5.5,6.93 3.5,3.46"/>
            <polygon points="12.5,0 16.5,0 18.5,3.46 16.5,6.93 12.5,6.93 10.5,3.46"/>
            <polygon points="5.5,7.07 9.5,7.07 11.5,10.54 9.5,14 5.5,14 3.5,10.54"/>
            <polygon points="12.5,7.07 16.5,7.07 18.5,10.54 16.5,14 12.5,14 10.5,10.54"/>
          </svg>
          Filtri{!loading && restaurants.length > 0 ? ` (${restaurants.length})` : ""}
        </button>

        <aside className={`search-sidebar${sidebarOpen ? " search-sidebar--open" : ""}`}>
          <div className="search-view-pill search-view-pill--sidebar" role="group" aria-label="Vista">
            <button
              type="button"
              className={`search-view-pill__btn${viewMode === "list" ? " is-active" : ""}`}
              onClick={() => switchView("list")}
            >
              Lista
            </button>
            <button
              type="button"
              className={`search-view-pill__btn${viewMode === "map" ? " is-active" : ""}`}
              onClick={() => switchView("map")}
            >
              Mappa
            </button>
          </div>

          <div className="search-sidebar__scroll">
            <p className="search-sidebar__label">Filtri</p>
            <div className="search-sidebar__group">{filterControls}</div>
            <div className="search-sidebar__locali">
              <button
                type="button"
                className="search-sidebar__locali-trigger"
                onClick={() => setLocaliOpen((v) => !v)}
              >
                <span className="search-sidebar__locali-label">Locali trovati</span>
                <span className="search-sidebar__locali-count">{loading ? "…" : restaurants.length}</span>
                <svg className={`search-sidebar__locali-chevron${localiOpen ? " is-open" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5 8l5 5 5-5"/></svg>
              </button>
              {localiOpen && !loading && (
                <ul className="search-sidebar__locali-list">
                  {restaurants.length === 0 && (
                    <li className="search-sidebar__locali-empty">Nessun locale trovato</li>
                  )}
                  {restaurants.map((r) => (
                    <li key={r.id}>
                      <Link className="rrow" href={`/restaurants/${r.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="rrow__img" src={r.heroImage} alt={r.name} />
                        <div className="rrow__info">
                          <strong className="rrow__name">{r.name}</strong>
                          <span className="rrow__meta">{r.neighborhood} · {r.cuisine}</span>
                          {r.discount && <span className="rrow__badge">-{r.discount}%</span>}
                        </div>
                        <span className="rrow__price">{r.priceRange.replace(/\$/g, "€")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" className="search-sidebar__reset" onClick={resetFilters}>
              Azzera filtri
            </button>
            <button type="button" className="search-sidebar__apply" onClick={() => setSidebarOpen(false)}>
              Applica filtri
            </button>
          </div>
        </aside>

        {viewMode === "map" ? (
          <div className="search-map-view">
            <LeafletMap
              center={
                filters.city && CITY_COORDS[filters.city]
                  ? CITY_COORDS[filters.city]!
                  : LAZIO_CENTER
              }
              zoom={filters.city && CITY_COORDS[filters.city] ? 12.5 : 10}
              fitToMarkers={false}
              markers={restaurants.map((r) => ({
                lat: r.coordinates.lat,
                lng: r.coordinates.lng,
                label: r.name,
                slug: r.slug,
                image: r.heroImage,
                neighborhood: r.neighborhood,
                cuisine: r.cuisine,
                budget: r.priceRange,
                rating: r.rating,
              }))}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        ) : (
          <div className="search-results">
            {loading && <SkeletonGrid />}
            {!loading && restaurants.length === 0 && (
              <div className="search-empty">
                <p className="search-empty__icon">🍋</p>
                <h2>Nessun locale trovato</h2>
                <p>Prova a rimuovere qualche filtro o cerca in un&apos;altra città.</p>
              </div>
            )}
            {!loading && restaurants.length > 0 && (
              <div className="search-grid">
                {restaurants.map((restaurant, i) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} priority={i < 3} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Results dropdown (triggered by header Filtri btn) ── */}
      {resultsOpen && (
        <>
          <div className="mobile-filter-backdrop" onClick={() => setResultsOpen(false)} />
          <div className="results-sheet">
            <div className="results-sheet__handle" />
            <div className="results-sheet__header">
              <h3>{loading ? "…" : `${restaurants.length} locali`}</h3>
              <button type="button" className="results-sheet__close" onClick={() => setResultsOpen(false)} aria-label="Chiudi">✕</button>
            </div>

            {/* Filters */}
            <div className="results-sheet__filters">
              <div className="search-sidebar__group">{filterControls}</div>
            </div>

            {/* Footer: reset + apply */}
            <div className="results-sheet__footer">
              <button type="button" className="mobile-filter-sheet__reset" onClick={resetFilters}>Azzera</button>
              <button type="button" className="mobile-filter-sheet__apply" onClick={() => setResultsOpen(false)}>
                Mostra {loading ? "…" : restaurants.length} locali
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Advanced filter sheet (desktop sidebar on mobile) ── */}
      {filtersOpen && (
        <>
          <div className="mobile-filter-backdrop" onClick={() => setFiltersOpen(false)} />
          <div className="mobile-filter-sheet">
            <div className="mobile-filter-sheet__header">
              <h3>Filtri avanzati</h3>
              <button type="button" className="mobile-filter-sheet__close" onClick={() => setFiltersOpen(false)} aria-label="Chiudi filtri">✕</button>
            </div>
            <div className="mobile-filter-sheet__body">
              <div className="search-sidebar__group">{filterControls}</div>
            </div>
            <div className="mobile-filter-sheet__footer">
              <button type="button" className="mobile-filter-sheet__reset" onClick={resetFilters}>Azzera</button>
              <button type="button" className="mobile-filter-sheet__apply" onClick={() => setFiltersOpen(false)}>
                Mostra {loading ? "…" : restaurants.length} locali
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
