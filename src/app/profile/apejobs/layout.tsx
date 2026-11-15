"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

// Solo la pagina indice (spiegazione "in arrivo") è raggiungibile — le
// sotto-pagine (cerca-lavoro, pagamenti, impostazioni) mostrano ancora dati
// finti da localStorage, quindi restano bloccate anche per chi apre l'URL
// direttamente.
export default function ApeJobsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isIndex = pathname === "/profile/apejobs";

  useEffect(() => {
    if (!isIndex) router.replace("/profile/apejobs");
  }, [isIndex, router]);

  if (!isIndex) return null;
  return children;
}
