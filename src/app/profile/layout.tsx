"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/profile",               icon: "◈",  label: "Panoramica" },
  { href: "/profile/prenotazioni",  icon: "≡",  label: "Prenotazioni" },
  { href: "/profile/attivita",      icon: "◷",  label: "Attività" },
  { href: "/profile/bees",          icon: "⬡",  label: "I miei BEES" },
];

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?from=/profile");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="user-dash-layout">
      <aside className="user-dash-sidebar">
      <div className="user-dash-sidebar__sticky">

        {/* Nav */}
        <nav className="user-dash-nav">
          {NAV_ITEMS.map((item) => {
            const exact = item.href === "/profile";
            const active = exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("user-dash-nav__item", active && "is-active")}
              >
                <span className="user-dash-nav__icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Decorative logo — right half only (the glass) */}
        <div className="user-dash-sidebar__deco" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/apeapplogo1.png" alt="" className="user-dash-sidebar__deco-img" />
        </div>

        {user.role === "commerciante" && (
          <div className="user-dash-sidebar__footer">
            <div className="user-dash-sidebar__foot-actions">
              <Link href="/dashboard" className="dash-foot-link">Dashboard</Link>
            </div>
          </div>
        )}

      </div>
      </aside>

      <div className="user-dash-main">
        {children}
      </div>
    </div>
  );
}
