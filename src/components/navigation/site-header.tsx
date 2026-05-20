"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClayLink } from "@/components/ui/clay-button";
import { useAuth } from "@/lib/auth/context";
import { useMobileMenu } from "@/lib/mobile-menu-context";
import { cn } from "@/lib/utils";
import { getBees } from "@/lib/bees/store";
import type { SVGProps } from "react";

type NavItem = {
  href: string;
  label: string;
  active?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/",                           label: "Home" },
  { href: "/search",                     label: "Scopri i locali" },
  { href: "/events",                     label: "Eventi" },
  { href: "/attivita",                   label: "Attività" },
  { href: "/come-funziona",              label: "Come funziona" },
  { href: "/#per-i-locali",              label: "Per i locali" },
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

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [bees, setBees] = useState(0);
  const [mobileCity, setMobileCity] = useState("Milano");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [searchOverlay, setSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapDate, setMapDate] = useState("");
  const [mapTime, setMapTime] = useState("");
  const [mapGuests, setMapGuests] = useState(2);
  const [activeMapFilter, setActiveMapFilter] = useState<"date" | "time" | "guests" | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (user) setBees(getBees(user.id));
  }, [user]);

  useEffect(() => { close(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const isProfilePage = pathname.startsWith("/profile");

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
            {NAV_ITEMS.map((item) => {
              const isAnchor = item.href.includes("#");
              const anchorId = isAnchor ? item.href.split("#")[1] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "desktop-nav__link",
                    (item.href === "/" ? pathname === "/" : isAnchor ? pathname === "/" : pathname.startsWith(item.href.split("?")[0]) && item.href !== "/") && "desktop-nav__link--home-active",
                    item.active && pathname === "/" && "desktop-nav__link--home-active",
                  )}
                  onClick={isAnchor ? (e) => {
                    e.preventDefault();
                    if (pathname !== "/") {
                      router.push("/");
                      setTimeout(() => document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" }), 400);
                    } else {
                      document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" });
                    }
                  } : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            {isMerchant && (
              <Link className="desktop-nav__link" href="/dashboard">
                Dashboard
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
                      Esci
                    </button>
                  </div>
                ) : (
                  <>
                    <Link className="header-auth-link header-auth-link--ghost" href="/login">
                      Accedi
                    </Link>
                    <Link className="header-auth-link header-auth-link--primary" href="/register">
                      Registrati
                    </Link>
                  </>
                )}
                {user && !isMerchant && (
                  <ClayLink href="/booking" className="header-cta">
                    Prenota ora
                  </ClayLink>
                )}
                {isMerchant && (
                  <ClayLink href="/dashboard" className="header-cta">
                    Dashboard
                  </ClayLink>
                )}
              </>
            )}
            <button
              className="menu-toggle"
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
                        onClick={() => { setMobileCity(c); setCityDropdown(false); }}
                      >
                        <PinIcon className="mobile-city-dropdown__icon" aria-hidden="true" />
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className="mobile-search-btn"
              type="button"
              onClick={() => setSearchOverlay(true)}
            >
              <SearchIcon className="mobile-search-btn__icon" aria-hidden="true" />
              <span>Cerca bar, tipo di aperitivo...</span>
            </button>
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
            onClick={() => { setSearchOverlay(false); setMapOpen(true); }}
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
              👥 {mapGuests} {mapGuests === 1 ? "pers." : "pers."} ↓
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
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mobileCity)}+Italia&output=embed&z=13`}
              title="Mappa locali"
              className="mobile-map-overlay__iframe"
              loading="lazy"
            />
            <button
              className="mobile-map-overlay__list-btn"
              type="button"
              onClick={() => {
                setMapOpen(false);
                router.push(`/search?city=${mobileCity}`);
              }}
            >
              Lista locali →
            </button>
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
          Cerca il tuo aperitivo stasera
        </Link>

        <nav className="mobile-nav" aria-label="Navigazione mobile">
          {NAV_ITEMS.map((item) => {
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
                  {item.label}
                </button>
              );
            }
            return (
              <Link key={item.href} href={item.href} onClick={close}>
                {item.label}
              </Link>
            );
          })}
          {isMerchant && (
            <Link href="/dashboard" onClick={close}>
              Dashboard
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
                Esci dall&apos;account
              </button>
            </div>
          ) : (
            <div className="mobile-drawer__auth">
              <ClayLink href="/login" variant="secondary" className="mobile-drawer__cta" onClick={close}>
                Accedi
              </ClayLink>
              <ClayLink href="/register" className="mobile-drawer__cta" onClick={close}>
                Registrati gratis
              </ClayLink>
            </div>
          )
        )}
      </aside>
    </>
  );
}
