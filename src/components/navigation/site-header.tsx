"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClayLink } from "@/components/ui/clay-button";
import { useAuth } from "@/lib/auth/context";
import { useMobileMenu } from "@/lib/mobile-menu-context";
import { useLang } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { getBees } from "@/lib/bees/store";
import type { SVGProps } from "react";

type NavItem = {
  href: string;
  label: string;
  active?: boolean;
};

const NAV_HREFS = [
  { href: "/",              key: "home"        as const },
  { href: "/search",        key: "search"      as const },
  { href: "/events",        key: "events"      as const },
  { href: "/attivita",      key: "activities"  as const },
  { href: "/come-funziona", key: "howItWorks"  as const },
  { href: "/#per-i-locali", key: "forVenues"   as const },
  { href: "/apejobs",       key: "forArtists"  as const },
];

const CITIES_MOBILE = ["Milano", "Roma", "Firenze", "Venezia", "Napoli", "Torino", "Bologna"];

function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FlagIT(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 3 2" aria-hidden="true" {...props}>
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ce2b37" />
    </svg>
  );
}

function FlagGB(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 30" aria-hidden="true" {...props}>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [bees, setBees] = useState(0);
  const [mobileCity, setMobileCity] = useState("Milano");
  const { lang, setLang, t } = useLang();

  function toggleLang() {
    setLang(lang === "it" ? "en" : "it");
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem("apehour_city");
      if (saved) setMobileCity(saved);
    } catch {}
  }, []);
  const [cityDropdown, setCityDropdown] = useState(false);
  const [searchOverlay, setSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapDate, setMapDate] = useState("");
  const [mapTime, setMapTime] = useState("");
  const [mapGuests, setMapGuests] = useState(2);
  const [activeMapFilter, setActiveMapFilter] = useState<"date" | "time" | "guests" | "budget" | null>(null);
  const [mapBudget, setMapBudget] = useState<"" | "$$" | "$$$" | "$$$$">("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const [restaurantCount, setRestaurantCount] = useState<number | null>(null);
  const { open, toggle, close } = useMobileMenu();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which anchor section (if any) is currently in view, so anchor
  // nav links only look "active" while their section is actually visible.
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  useEffect(() => {
    if (pathname !== "/") { setActiveAnchor(null); return; }
    const anchorIds = NAV_HREFS
      .filter((item) => item.href.includes("#"))
      .map((item) => item.href.split("#")[1]!);

    function onScroll() {
      const triggerY = 100; // just below the sticky header
      let current: string | null = null;
      for (const id of anchorIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerY && rect.bottom > triggerY) {
          current = id;
          break;
        }
      }
      setActiveAnchor(current);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (user) setBees(getBees(user.id));
  }, [user]);

  useEffect(() => { close(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merchants are confined to the dashboard: bounce back even if they
  // navigate away via the browser back/forward buttons.
  useEffect(() => {
    if (!loading && user?.role === "commerciante" && !pathname.startsWith("/dashboard")) {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const handler = (e: Event) => {
      setRestaurantCount((e as CustomEvent<number | null>).detail);
    };
    window.addEventListener("apehour:restaurants-count", handler);
    return () => window.removeEventListener("apehour:restaurants-count", handler);
  }, []);

  // Close city dropdown on outside click
  useEffect(() => {
    if (!cityDropdown) return;
    function handler(e: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cityDropdown]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOverlay) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOverlay]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleSearchSubmit() {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    params.set("city", mobileCity);
    router.push(`/search?${params.toString()}`);
    setSearchOverlay(false);
  }

  const isMerchant = user?.role === "commerciante";
  const isHome = pathname === "/";
  const isProfilePage =
    pathname.startsWith("/profile") ||
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/come-funziona" ||
    pathname.startsWith("/offers") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/attivita");

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <>
      <header className={cn("site-header", scrolled && "site-header--solid")}>
        <div className={cn("site-header__inner", isHome && "site-header__inner--home")}>
          <Link className="brand" href="/" aria-label="ApeTable home">
            <span className="brand__mark" aria-hidden="true">
              <Image src="/apeapplogo1.png" alt="" width={200} height={200} className="brand__logo-img" />
            </span>
            <span className="brand__text">
              Ape<span className="brand__text-accent">Hour</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Navigazione principale">
            {NAV_HREFS.map((item) => {
              const label = item.key === "home" ? "Home" : t.nav[item.key];
              const isAnchor = item.href.includes("#");
              const anchorId = isAnchor ? item.href.split("#")[1] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "desktop-nav__link",
                    (item.href === "/" ? pathname === "/" && !activeAnchor : isAnchor ? activeAnchor === anchorId : pathname.startsWith(item.href.split("?")[0]) && item.href !== "/") && "desktop-nav__link--home-active",
                  )}
                  onClick={isAnchor ? (e) => {
                    e.preventDefault();
                    if (pathname !== "/") {
                      router.push("/");
                      setTimeout(() => document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" }), 400);
                    } else {
                      document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" });
                    }
                  } : item.href === "/" ? (e) => {
                    if (pathname === "/") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  } : undefined}
                >
                  {label}
                </Link>
              );
            })}
            {isMerchant && (
              <Link className="desktop-nav__link" href="/dashboard">
                {t.nav.dashboard}
              </Link>
            )}
          </nav>

          <div className="header-actions">
            {!loading && (
              <>
                {user ? (
                  <div className="user-menu">
                    <Link
                      href={isMerchant ? "/dashboard" : "/profile"}
                      className="user-menu__profile-link"
                    >
                      <span className="user-avatar" aria-hidden="true">
                        {user.name[0].toUpperCase()}
                      </span>
                      <span className="user-name">{user.name.split(" ")[0]}</span>
                    </Link>
                    {!isMerchant && (
                      <Link href="/profile/bees" className="user-bees-badge" title="I tuoi BEES">
                        🐝 {bees}
                      </Link>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>
                      {t.header.logout}
                    </button>
                  </div>
                ) : (
                  <>
                    <Link className="header-auth-link header-auth-link--ghost" href="/login">
                      {t.header.login}
                    </Link>
                    <Link className="header-auth-link header-auth-link--primary" href="/register">
                      {t.header.register}
                    </Link>
                  </>
                )}
              </>
            )}
            <button
              type="button"
              className="lang-toggle"
              onClick={toggleLang}
              aria-label={lang === "it" ? "Switch to English" : "Passa all'italiano"}
            >
              <span className={`lang-toggle__opt${lang === "it" ? " is-active" : ""}`}>
                <FlagIT className="lang-toggle__flag" />
                IT
              </span>
              <span className="lang-toggle__sep">|</span>
              <span className={`lang-toggle__opt${lang === "en" ? " is-active" : ""}`}>
                <FlagGB className="lang-toggle__flag" />
                EN
              </span>
            </button>
            {!loading && isMerchant && (
              <ClayLink href="/dashboard" className="header-cta">
                {t.nav.dashboard}
              </ClayLink>
            )}
            <button
              className={cn("menu-toggle", open && "is-open")}
              type="button"
              aria-label={open ? "Chiudi menu" : "Apri menu"}
              aria-expanded={open}
              onClick={toggle}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile-only: merchant sub-links — hidden in app mode */}
        {!user && (
          <div className="mobile-merchant-bar">
            <div className="mobile-merchant-bar__side" />
            <div className="mobile-merchant-bar__center">
              <button type="button" className="mobile-lang-toggle" onClick={toggleLang} aria-label={lang === "it" ? "Switch to English" : "Passa all'italiano"}>
                <span className={`mobile-lang-toggle__opt${lang === "it" ? " is-active" : ""}`}><FlagIT className="lang-toggle__flag" /> IT</span>
                <span className="mobile-lang-toggle__sep">|</span>
                <span className={`mobile-lang-toggle__opt${lang === "en" ? " is-active" : ""}`}><FlagGB className="lang-toggle__flag" /> EN</span>
              </button>
            </div>
            <div className="mobile-merchant-bar__side mobile-merchant-bar__side--right">
              <Link href="/register" className="mobile-merchant-bar__link">{t.merchantBar.hasVenue}</Link>
              <span className="mobile-merchant-bar__sep" aria-hidden="true">·</span>
              <Link href="/come-funziona" className="mobile-merchant-bar__link">{t.merchantBar.faq}</Link>
            </div>
          </div>
        )}

        {/* Mobile-only: city selector + search bar (hidden on profile pages) */}
        <div className={`mobile-city-bar${isProfilePage ? " mobile-city-bar--hidden" : ""}`}>
          <div className="mobile-city-bar__inner">
            <div className="mobile-city-wrap" ref={cityDropdownRef}>
              <button
                className="mobile-city-btn"
                type="button"
                onClick={() => setCityDropdown((v) => !v)}
                aria-expanded={cityDropdown}
              >
                <PinIcon className="mobile-city-btn__icon" aria-hidden="true" />
                <span>{mobileCity}, Italia</span>
                <ChevronDownIcon
                  className={cn("mobile-city-btn__chevron", cityDropdown && "mobile-city-btn__chevron--up")}
                  aria-hidden="true"
                />
              </button>
              {cityDropdown && (
                <ul className="mobile-city-dropdown" role="listbox">
                  {CITIES_MOBILE.map((c) => (
                    <li key={c} role="option" aria-selected={c === mobileCity}>
                      <button
                        type="button"
                        className={cn("mobile-city-dropdown__item", c === mobileCity && "is-active")}
                        onClick={() => {
                          setMobileCity(c);
                          try { localStorage.setItem("apehour_city", c); } catch {}
                          setCityDropdown(false);
                          if (pathname === "/search") {
                            const params = new URLSearchParams(window.location.search);
                            params.set("city", c);
                            router.push(`/search?${params.toString()}`);
                          }
                        }}
                      >
                        <PinIcon className="mobile-city-dropdown__icon" aria-hidden="true" />
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {pathname === "/search" ? (
              <button
                className="mobile-search-btn mobile-search-btn--filtri"
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("apehour:open-filters"))}
              >
                <svg className="mobile-search-btn__icon" viewBox="0 0 22 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <polygon points="5.5,0 9.5,0 11.5,3.46 9.5,6.93 5.5,6.93 3.5,3.46" />
                  <polygon points="12.5,0 16.5,0 18.5,3.46 16.5,6.93 12.5,6.93 10.5,3.46" />
                  <polygon points="5.5,7.07 9.5,7.07 11.5,10.54 9.5,14 5.5,14 3.5,10.54" />
                  <polygon points="12.5,7.07 16.5,7.07 18.5,10.54 16.5,14 12.5,14 10.5,10.54" />
                </svg>
                <span className="mobile-search-btn__filtri-label">{t.header.filters}</span>
                {restaurantCount !== null && (
                  <span className="mobile-search-btn__filtri-count">
                    {t.restaurantCount(restaurantCount)}
                  </span>
                )}
              </button>
            ) : (
              <button
                className="mobile-search-btn"
                type="button"
                onClick={() => setSearchOverlay(true)}
              >
                <SearchIcon className="mobile-search-btn__icon" aria-hidden="true" />
                <span>{t.header.searchPlaceholder}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {searchOverlay && (
        <div className="mobile-search-overlay" role="dialog" aria-modal="true" aria-label="Cerca locali">
          <div className="mobile-search-overlay__bar">
            <button
              className="mobile-search-overlay__close"
              type="button"
              onClick={() => setSearchOverlay(false)}
              aria-label="Chiudi ricerca"
            >
              ✕
            </button>
            <div className="mobile-search-overlay__input-wrap">
              <SearchIcon className="mobile-search-overlay__input-icon" aria-hidden="true" />
              <input
                ref={searchInputRef}
                className="mobile-search-overlay__input"
                type="text"
                placeholder="Cerca bar, aperitivo, cocktail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
              />
            </div>
          </div>

          {/* See all locations */}
          <button
            className="mobile-search-overlay__locations"
            type="button"
            onClick={() => { setSearchOverlay(false); router.push(`/search?view=map&city=${encodeURIComponent(mobileCity)}`); }}
          >
            <span className="mobile-search-overlay__locations-icon">
              <MapIcon aria-hidden="true" />
            </span>
            <span className="mobile-search-overlay__locations-text">
              <strong>Tutti i locali</strong>
              <span>{mobileCity}, Italia</span>
            </span>
            <ChevronRightIcon className="mobile-search-overlay__locations-arrow" aria-hidden="true" />
          </button>

          <div className="mobile-search-overlay__recents">
            <p className="mobile-search-overlay__recents-title">Ricerche recenti</p>
            {["Aperitivo Milano", "Cocktail bar Roma", "Spritz Venezia"].map((q) => (
              <button
                key={q}
                className="mobile-search-overlay__recent-item"
                type="button"
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(q)}&city=${mobileCity}`);
                  setSearchOverlay(false);
                }}
              >
                <ClockIcon className="mobile-search-overlay__recent-icon" aria-hidden="true" />
                <span>{q}</span>
                <ChevronRightIcon className="mobile-search-overlay__recent-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map modal */}
      {mapOpen && (
        <div className="mobile-map-overlay" role="dialog" aria-modal="true" aria-label="Mappa locali">
          <div className="mobile-map-overlay__header">
            <button
              className="mobile-map-overlay__back"
              type="button"
              onClick={() => setMapOpen(false)}
              aria-label="Chiudi mappa"
            >
              ←
            </button>
            <div className="mobile-map-overlay__search-bar">
              <SearchIcon className="mobile-map-overlay__search-icon" aria-hidden="true" />
              <div className="mobile-map-overlay__search-text">
                <strong>Tutti i locali</strong>
                <span>{mobileCity}, Italia</span>
              </div>
            </div>
          </div>
          {/* Filter pills — full width, evenly spaced */}
          <div className="mobile-map-overlay__filters">
            <button
              type="button"
              className={`mobile-map-overlay__filter-pill${activeMapFilter === "date" ? " is-active" : ""}${mapDate ? " has-value" : ""}`}
              onClick={() => setActiveMapFilter(activeMapFilter === "date" ? null : "date")}
            >
              📅 {mapDate ? new Date(mapDate + "T00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : "Data"} ↓
            </button>
            <button
              type="button"
              className={`mobile-map-overlay__filter-pill${activeMapFilter === "time" ? " is-active" : ""}${mapTime ? " has-value" : ""}`}
              onClick={() => setActiveMapFilter(activeMapFilter === "time" ? null : "time")}
            >
              🕐 {mapTime || "Ora"} ↓
            </button>
            <button
              type="button"
              className={`mobile-map-overlay__filter-pill${activeMapFilter === "guests" ? " is-active" : ""}${mapGuests !== 2 ? " has-value" : ""}`}
              onClick={() => setActiveMapFilter(activeMapFilter === "guests" ? null : "guests")}
            >
              👥 {mapGuests} pers. ↓
            </button>
            <button
              type="button"
              className={`mobile-map-overlay__filter-pill${activeMapFilter === "budget" ? " is-active" : ""}${mapBudget ? " has-value" : ""}`}
              onClick={() => setActiveMapFilter(activeMapFilter === "budget" ? null : "budget")}
            >
              💰 {mapBudget === "$$" ? "€" : mapBudget === "$$$" ? "€€" : mapBudget === "$$$$" ? "€€€" : "Budget"} ↓
            </button>
          </div>

          {/* Filter dropdown panel */}
          {activeMapFilter && (
            <div className="mobile-map-filter-panel">
              {activeMapFilter === "date" && (
                <div className="mobile-map-filter-panel__date">
                  <div className="mobile-map-filter-panel__quick">
                    {[
                      { label: "Oggi",   value: new Date().toISOString().split("T")[0]! },
                      { label: "Domani", value: new Date(Date.now() + 86400000).toISOString().split("T")[0]! },
                      { label: "Weekend", value: (() => { const d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); return d.toISOString().split("T")[0]!; })() },
                    ].map(({ label, value }) => (
                      <button
                        key={label}
                        type="button"
                        className={`mobile-map-filter-panel__quick-btn${mapDate === value ? " is-active" : ""}`}
                        onClick={() => { setMapDate(value); setActiveMapFilter(null); }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="date"
                    className="mobile-map-filter-panel__date-input"
                    value={mapDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setMapDate(e.target.value); setActiveMapFilter(null); }}
                  />
                </div>
              )}

              {activeMapFilter === "time" && (
                <div className="mobile-map-filter-panel__time">
                  {["17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`mobile-map-filter-panel__time-btn${mapTime === t ? " is-active" : ""}`}
                      onClick={() => { setMapTime(t); setActiveMapFilter(null); }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {activeMapFilter === "budget" && (
                <div className="mobile-map-filter-panel__budget">
                  {([
                    { value: "" as const,     label: "Tutti",        budget: "",    imgSrc: "" },
                    { value: "$$" as const,   label: "Vespa Sprint", budget: "€",   imgSrc: "/vespa.png" },
                    { value: "$$$" as const,  label: "Ape Plus",     budget: "€€",  imgSrc: "/plus.png" },
                    { value: "$$$$" as const, label: "Bombo Queen",  budget: "€€€", imgSrc: "/bombo.png" },
                  ]).map((opt) => (
                    <button
                      key={opt.value || "all"}
                      type="button"
                      className={`mobile-map-filter-panel__budget-btn${mapBudget === opt.value ? " is-active" : ""}`}
                      onClick={() => { setMapBudget(opt.value); setActiveMapFilter(null); }}
                    >
                      {opt.imgSrc
                        /* eslint-disable-next-line @next/next/no-img-element */
                        ? <img src={opt.imgSrc} alt="" className="mobile-map-filter-panel__budget-img" />
                        : <span>🎉</span>
                      }
                      <span>{opt.label}</span>
                      {opt.budget && <span className="mobile-map-filter-panel__budget-sym">{opt.budget}</span>}
                    </button>
                  ))}
                </div>
              )}

              {activeMapFilter === "guests" && (
                <div className="mobile-map-filter-panel__guests">
                  <button
                    type="button"
                    className="mobile-map-filter-panel__stepper-btn"
                    onClick={() => setMapGuests((v) => Math.max(1, v - 1))}
                    aria-label="Meno persone"
                  >
                    −
                  </button>
                  <span className="mobile-map-filter-panel__stepper-val">
                    {mapGuests} {mapGuests === 1 ? "persona" : "persone"}
                  </span>
                  <button
                    type="button"
                    className="mobile-map-filter-panel__stepper-btn"
                    onClick={() => setMapGuests((v) => Math.min(10, v + 1))}
                    aria-label="Più persone"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="mobile-map-overlay__map">
            <iframe
              src={`https://maps.google.com/maps?q=aperitivo+bar+${encodeURIComponent(mobileCity)}&output=embed&z=14`}
              title="Mappa locali"
              className="mobile-map-overlay__iframe"
              loading="lazy"
            />
          </div>
          <div className="mobile-map-overlay__footer">
            <div className="search-view-pill search-view-pill--inline" role="group" aria-label="Vista">
              <button
                type="button"
                className="search-view-pill__btn"
                onClick={() => {
                  setMapOpen(false);
                  router.push(`/search?city=${encodeURIComponent(mobileCity)}${mapBudget ? `&priceRange=${mapBudget}` : ""}`);
                }}
              >
                Lista
              </button>
              <button
                type="button"
                className="search-view-pill__btn is-active"
              >
                Mappa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={cn("drawer-backdrop", open && "is-open")} onClick={close} />
      <aside className={cn("mobile-drawer", open && "is-open")} aria-hidden={!open}>
        <div className="mobile-drawer__top">
          <Link className="brand" href="/" onClick={close}>
            <span className="brand__mark" aria-hidden="true">
              <Image src="/apeapplogo1.png" alt="" width={200} height={200} className="brand__logo-img" />
            </span>
            <span className="brand__text">
              Ape<span className="brand__text-accent">Hour</span>
            </span>
          </Link>
          <button type="button" onClick={close} aria-label="Chiudi menu">
            ✕
          </button>
        </div>

        <Link className="mobile-search" href="/search" onClick={close}>
          {lang === "it" ? "Cerca il tuo aperitivo stasera" : "Find your aperitivo tonight"}
        </Link>

        <nav className="mobile-nav" aria-label="Navigazione mobile">
          {NAV_HREFS.map((item) => {
            const label = item.key === "home" ? "Home" : t.nav[item.key];
            const isAnchor = item.href.includes("#");
            const anchorId = isAnchor ? item.href.split("#")[1] : null;
            if (isAnchor) {
              return (
                <button
                  key={item.href}
                  type="button"
                  className="mobile-nav__anchor-btn"
                  onClick={() => {
                    close();
                    if (pathname !== "/") {
                      router.push("/");
                      setTimeout(() => document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" }), 400);
                    } else {
                      document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {label}
                </button>
              );
            }
            return (
              <Link key={item.href} href={item.href} onClick={close}>
                {label}
              </Link>
            );
          })}
          {isMerchant && (
            <Link href="/dashboard" onClick={close}>
              {t.nav.dashboard}
            </Link>
          )}
        </nav>

        {!loading && (
          user ? (
            <div className="mobile-drawer__user">
              <Link
                href={isMerchant ? "/dashboard" : "/profile"}
                className="dashboard-user"
                onClick={close}
              >
                <span className="user-avatar">{user.name[0].toUpperCase()}</span>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                {lang === "it" ? "Esci dall'account" : "Log out"}
              </button>
            </div>
          ) : (
            <div className="mobile-drawer__auth">
              <ClayLink href="/login" variant="secondary" className="mobile-drawer__cta" onClick={close}>
                {t.header.login}
              </ClayLink>
              <ClayLink href="/register" className="mobile-drawer__cta" onClick={close}>
                {lang === "it" ? "Registrati gratis" : "Sign up free"}
              </ClayLink>
              <div className="mobile-drawer__sub-links">
                <Link href="/register" className="mobile-drawer__sub-link" onClick={close}>{t.merchantBar.hasVenue}</Link>
                <Link href="/come-funziona" className="mobile-drawer__sub-link" onClick={close}>{t.merchantBar.faq}</Link>
              </div>
            </div>
          )
        )}
      </aside>
    </>
  );
}
