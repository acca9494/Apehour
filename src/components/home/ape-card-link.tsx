"use client";

import { useRouter } from "next/navigation";

type Props = {
  priceRange: string;
  children: React.ReactNode;
};

export function ApeCardLink({ priceRange, children }: Props) {
  const router = useRouter();

  function handleClick() {
    let city = "Milano";
    try { city = localStorage.getItem("apehour_city") ?? "Milano"; } catch {}
    router.push(`/search?priceRange=${priceRange}&view=map&city=${encodeURIComponent(city)}`);
  }

  return (
    <button type="button" className="offer-card__ape-mobile" onClick={handleClick}>
      {children}
    </button>
  );
}
