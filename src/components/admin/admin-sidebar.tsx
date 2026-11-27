"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin",                    icon: "◈", label: "Da verificare" },
  { href: "/admin#call-requests",      icon: "☎", label: "Richieste di call" },
  { href: "/admin#cancellazioni",      icon: "✕", label: "Cancellazioni account" },
  { href: "/admin#verificati",         icon: "✓", label: "Locali verificati" },
  { href: "/admin/traffico",           icon: "◷", label: "Traffico del sito" },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        <Link className="dash-brand-link" href="/">
          <Image src="/apeapplogo1.png" alt="ApeHour" width={72} height={72} className="dash-brand-logo" />
          <span className="dash-brand-text">Ape<span className="dash-brand-accent">Hour</span></span>
        </Link>
      </div>

      <nav className="dashboard-nav">
        {NAV_ITEMS.map((item) => {
          const isAnchor = item.href.includes("#");
          const active = !isAnchor && pathname === item.href;
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

      <div className="dashboard-sidebar__footer">
        <div className="dashboard-sidebar__user">
          <span className="dash-avatar">{email[0].toUpperCase()}</span>
          <div className="dashboard-sidebar__user-info">
            <strong>Admin</strong>
            <span>{email}</span>
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
  );
}
