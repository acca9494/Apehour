"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

// Solo la pagina indice (spiegazione "in arrivo") è raggiungibile — le
// sotto-pagine (offerte, pagamenti) mostrano ancora dati finti da
// localStorage, quindi restano bloccate anche per chi apre l'URL direttamente.
export default function ApeJobsMerchantLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isIndex = pathname === "/dashboard/artisti";

  useEffect(() => {
    if (!isIndex) router.replace("/dashboard/artisti");
  }, [isIndex, router]);

  if (!isIndex) return null;
  return children;
}
