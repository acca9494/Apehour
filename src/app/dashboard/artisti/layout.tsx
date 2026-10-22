"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

// ApeJobs è "coming soon" (voce nascosta dal menu dashboard) e queste pagine
// mostrano ancora dati finti da localStorage: bloccate anche per chi apre
// l'URL direttamente, stesso trattamento già dato a /dashboard/pagamenti.
export default function ApeJobsMerchantLayout({ children: _children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
