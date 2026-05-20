import type { Metadata } from "next";
import { SearchResultsClient } from "@/components/search/search-results-client";
import type { Cuisine, SearchFilters } from "@/lib/types";

export const metadata: Metadata = {
  title: "Scopri i locali — ApeHour",
  description: "Trova il bar perfetto per il tuo aperitivo. Filtra per città, ora, tipo di locale e prenota subito.",
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : {};
  const filters: SearchFilters = {
    city: readParam(params, "city"),
    date: readParam(params, "date"),
    time: readParam(params, "time"),
    guests: Number(readParam(params, "guests") ?? 2),
    cuisine: readParam(params, "cuisine") as Cuisine | undefined,
  };

  return <SearchResultsClient initialFilters={filters} />;
}
