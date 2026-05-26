"use client";

import { useEffect, type ReactNode } from "react";

export default function SearchLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add("is-search-page");
    return () => document.body.classList.remove("is-search-page");
  }, []);

  return <>{children}</>;
}
