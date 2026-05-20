"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClayLink } from "@/components/ui/clay-button";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import { getBees } from "@/lib/bees/store";

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

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bees, setBees] = useState(0);
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

  useEffect(() => { setOpen(false); }, [pathname]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const isMerchant = user?.role === "commerciante";
  const isHome = pathname === "/";

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
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={cn("drawer-backdrop", open && "is-open")} onClick={() => setOpen(false)} />
      <aside className={cn("mobile-drawer", open && "is-open")} aria-hidden={!open}>
        <div className="mobile-drawer__top">
          <Link className="brand" href="/" onClick={() => setOpen(false)}>
            <span className="brand__mark" aria-hidden="true">
              <Image src="/apeapplogo1.png" alt="" width={200} height={200} className="brand__logo-img" />
            </span>
            <span className="brand__text">
              Ape<span className="brand__text-accent">Hour</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi menu">
            ✕
          </button>
        </div>

        <Link className="mobile-search" href="/search" onClick={() => setOpen(false)}>
          Cerca il tuo aperitivo stasera
        </Link>

        <nav className="mobile-nav" aria-label="Navigazione mobile">
          {NAV_ITEMS.map((item) => {
            const isAnchor = item.href.includes("#");
            const anchorId = isAnchor ? item.href.split("#")[1] : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isAnchor ? (e) => {
                  e.preventDefault();
                  setOpen(false);
                  if (pathname !== "/") {
                    router.push("/");
                    setTimeout(() => document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" }), 400);
                  } else {
                    document.getElementById(anchorId!)?.scrollIntoView({ behavior: "smooth" });
                  }
                } : () => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          {isMerchant && (
            <Link href="/dashboard" onClick={() => setOpen(false)}>
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
                onClick={() => setOpen(false)}
              >
                <span className="user-avatar">{user.name[0].toUpperCase()}</span>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </Link>
              <button className="logout-btn" onClick={handleLogout} style={{ width: "100%", marginTop: "0.75rem" }}>
                Esci dall&apos;account
              </button>
            </div>
          ) : (
            <>
              <ClayLink href="/login" variant="secondary" className="mobile-drawer__cta" onClick={() => setOpen(false)}>
                Accedi
              </ClayLink>
              <ClayLink href="/register" className="mobile-drawer__cta" onClick={() => setOpen(false)}>
                Registrati gratis
              </ClayLink>
            </>
          )
        )}
      </aside>
    </>
  );
}
