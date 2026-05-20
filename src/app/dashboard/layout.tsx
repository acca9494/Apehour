"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",               icon: "◈",  label: "Panoramica" },
  { href: "/dashboard/prenotazioni",  icon: "≡",  label: "Prenotazioni" },
  { href: "/dashboard/tavoli",        icon: "⊞",  label: "Tavoli" },
  { href: "/dashboard/disponibilita", icon: "◷",  label: "Disponibilità" },
  { href: "/dashboard/pagamenti",     icon: "◎",  label: "Pagamenti" },
  { href: "/dashboard/impostazioni",  icon: "◌",  label: "Impostazioni" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userPopup, setUserPopup] = useState(false);
  const [navScroll, setNavScroll] = useState<"start" | "mid" | "end">("start");
  const popupRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!userPopup) return;
    function handler(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setUserPopup(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userPopup]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const atStart = el.scrollLeft <= 4;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setNavScroll(atStart ? "start" : atEnd ? "end" : "mid");
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== "commerciante")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">

        {/* Brand */}
        <div className="dashboard-sidebar__brand">
          <Link className="dash-brand-link" href="/">
            <Image src="/apeapplogo1.png" alt="ApeHour" width={72} height={72} className="dash-brand-logo" />
            <span className="dash-brand-text">Ape<span className="dash-brand-accent">Hour</span></span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="dashboard-nav">
          {NAV_ITEMS.map((item) => {
            const exact = item.href === "/dashboard";
            const active = exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("dashboard-nav__item", active && "is-active")}
              >
                <span className="dashboard-nav__icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Venue pill */}
        <div className="dashboard-sidebar__venue-wrap">
          <div className="dashboard-sidebar__venue-pill">
            <span className="dashboard-sidebar__venue-hex" aria-hidden="true" />
            <span>{user.name}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="dashboard-sidebar__footer">
          <div className="dashboard-sidebar__user">
            <span className="dash-avatar">{user.name[0].toUpperCase()}</span>
            <div className="dashboard-sidebar__user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button
              className="dash-logout-btn"
              onClick={() => { logout(); router.push("/"); }}
              title="Esci"
            >
              Esci
            </button>
          </div>
        </div>

      </aside>

      <div className="dashboard-main">

        {/* Mobile-only: compact topbar with brand + user */}
        <div className="dashboard-mobile-topbar">
          <Link href="/" className="dashboard-mobile-topbar__brand">
            <Image src="/apeapplogo1.png" alt="" width={60} height={60} className="dashboard-mobile-topbar__logo" />
            Ape<span>Hour</span>
          </Link>
          <div className="dashboard-mobile-topbar__right" ref={popupRef}>
            <button
              className="dashboard-mobile-topbar__user-btn"
              type="button"
              onClick={() => setUserPopup((v) => !v)}
            >
              <span className="dash-avatar">{user.name[0].toUpperCase()}</span>
              <span className="dashboard-mobile-topbar__username">{user.name.split(" ")[0]}</span>
            </button>
            {userPopup && (
              <div className="dashboard-mobile-user-popup">
                <p className="dashboard-mobile-user-popup__name">{user.name}</p>
                <p className="dashboard-mobile-user-popup__email">{user.email}</p>
                <button
                  className="dashboard-mobile-user-popup__logout"
                  onClick={() => { logout(); router.push("/"); }}
                >
                  Esci dall&apos;account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-only: horizontal tab nav */}
        <div className="dashboard-mobile-nav-wrap">
          <nav
            ref={navRef}
            className="dashboard-mobile-nav"
            aria-label="Navigazione dashboard"
          >
            {NAV_ITEMS.map((item) => {
              const exact = item.href === "/dashboard";
              const active = exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("dashboard-mobile-nav__item", active && "is-active")}
                >
                  <span className="dashboard-mobile-nav__icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {navScroll !== "end" && (
            <div className="dashboard-mobile-nav__hint-right" aria-hidden="true" />
          )}
          {navScroll !== "start" && (
            <div className="dashboard-mobile-nav__hint-left" aria-hidden="true" />
          )}
        </div>

        <div className="dashboard-mobile-content">
          {children}
        </div>
      </div>
    </div>
  );
}
