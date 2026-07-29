"use client";

import { useRouter } from "next/navigation";

type Props = {
  priceRange: string;
  children: React.ReactNode;
};

export function ApeCardLink({ priceRange, children }: Props) {
  const router = useRouter();

  function handleClick() {
    let city = "Roma";
    try { city = localStorage.getItem("apehour_city") ?? "Roma"; } catch {}
    router.push(`/search?priceRange=${priceRange}&view=map&city=${encodeURIComponent(city)}`);
  }

  return (
    <button type="button" className="offer-card__ape-mobile" onClick={handleClick}>
      {children}
    </button>
  );
}
