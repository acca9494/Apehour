"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/lib/mobile-menu-context";

type IconProps = SVGProps<SVGSVGElement>;

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const LINK_ITEMS = [
  { href: "/",          label: "Home",      Icon: HomeIcon },
  { href: "/search",    label: "Cerca",     Icon: SearchIcon },
  { href: "/favorites", label: "Preferiti", Icon: HeartIcon },
  { href: "/profile",   label: "Profilo",   Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { open, toggle } = useMobileMenu();

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <nav className="bottom-nav" aria-label="Navigazione principale">
      {LINK_ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(active && "is-active")}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav__icon">
              <Icon />
            </span>
            {label}
          </Link>
        );
      })}

      {/* Menu item — opens the mobile drawer */}
      <button
        type="button"
        className={cn("bottom-nav__menu-btn", open && "is-active")}
        onClick={toggle}
        aria-label="Apri menu"
        aria-expanded={open}
      >
        <span className="bottom-nav__icon">
          <MenuIcon />
        </span>
        Menu
      </button>
    </nav>
  );
}
