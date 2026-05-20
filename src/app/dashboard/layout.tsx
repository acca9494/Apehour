"use client";

import { useEffect } from "react";
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
        {children}
      </div>
    </div>
  );
}
