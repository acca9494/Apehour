import type { Metadata } from "next";
import { FavoritesClient } from "@/components/favorites/favorites-client";

export const metadata: Metadata = {
  title: "Preferiti",
  description: "I locali che hai salvato.",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
