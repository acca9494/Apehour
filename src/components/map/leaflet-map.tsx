"use client";

import { useEffect, useRef } from "react";

export type MapMarker = {
  lat: number;
  lng: number;
  label: string;
  slug: string;
  image: string;
  neighborhood: string;
  cuisine: string;
  budget: string;
};

type Props = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  style?: React.CSSProperties;
};

function budgetLabel(budget: string): string {
  if (budget === "$$") return "€";
  if (budget === "$$$") return "€€";
  if (budget === "$$$$") return "€€€";
  return "€";
}

export default function LeafletMap({ center, zoom = 13, markers = [], className, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const LRef         = useRef<typeof import("leaflet") | null>(null);
  const layerRef     = useRef<ReturnType<typeof import("leaflet")["layerGroup"]> | null>(null);

  // ── Init map once ────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    import("leaflet").then((mod) => {
      if (mapRef.current || !containerRef.current) return;
      const L = mod.default ?? mod;
      LRef.current = L;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current!, { zoomControl: false })
        .setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const layer = L.layerGroup().addTo(map);
      layerRef.current = layer;

      // Let the browser finish layout before rendering markers
      requestAnimationFrame(() => {
        map.invalidateSize();
        renderMarkers(L, map, layer, markers);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        LRef.current = null;
        layerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-render markers whenever the prop changes ──
  useEffect(() => {
    if (!mapRef.current || !LRef.current || !layerRef.current) return;
    renderMarkers(LRef.current, mapRef.current, layerRef.current, markers);
  }, [markers]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className={className} style={{ position: "relative", height: "100%", width: "100%", ...style }}>
        <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      </div>
    </>
  );
}

function renderMarkers(
  L: typeof import("leaflet"),
  map: ReturnType<typeof import("leaflet")["map"]>,
  layer: ReturnType<typeof import("leaflet")["layerGroup"]>,
  markers: MapMarker[],
) {
  layer.clearLayers();
  if (markers.length === 0) return;

  markers.forEach(({ lat, lng, label, slug, image, neighborhood, cuisine, budget }) => {
    const euros = budgetLabel(budget);
    const cardHtml = `
      <a class="mcrd" href="/restaurants/${slug}">
        <img class="mcrd__img" src="${image}" alt="${label}" />
        <div class="mcrd__body">
          <span class="mcrd__budget">${euros}</span>
          <strong class="mcrd__name">${label}</strong>
          <span class="mcrd__tag">${cuisine}</span>
          <span class="mcrd__hood">${neighborhood}</span>
          <span class="mcrd__cta">Prenota</span>
        </div>
      </a>`;

    const icon = L.divIcon({
      html: cardHtml,
      className: "mcrd-wrap",
      iconSize: [160, 155],
      iconAnchor: [80, 155],
    });

    L.marker([lat, lng], { icon }).addTo(layer);
  });

  if (markers.length > 1) {
    const bounds = L.latLngBounds(markers.map(({ lat, lng }) => [lat, lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }
}
