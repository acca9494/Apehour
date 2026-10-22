"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

// ApeJobs è "coming soon" (voce nascosta dal menu profilo) e queste pagine
// girano ancora su dati salvati solo nel browser (localStorage): bloccate
// anche per chi apre l'URL direttamente, stesso trattamento già dato alla
// versione commerciante e a /dashboard/pagamenti.
export default function ApeJobsLayout({ children: _children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
