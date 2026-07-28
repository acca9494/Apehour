"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SUB_NAV = [
  { href: "/dashboard/artisti",         label: "Panoramica" },
  { href: "/dashboard/artisti/offerte", label: "Le mie offerte di lavoro" },
  { href: "/dashboard/artisti/pagamenti", label: "Pagamenti" },
];

export default function ApeJobsMerchantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="apejobs-subnav">
        {SUB_NAV.map((item) => {
          const active = item.href === "/dashboard/artisti" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("apejobs-subnav__item", active && "is-active")}>
              {item.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
