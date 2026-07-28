"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function AppModeBody() {
  const searchParams = useSearchParams();
  const isApp = searchParams.get("mode") === "app";

  useEffect(() => {
    if (isApp) {
      document.body.classList.add("app-mode");
    } else {
      document.body.classList.remove("app-mode");
    }
    return () => document.body.classList.remove("app-mode");
  }, [isApp]);

  return null;
}
