"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  lat: number;
  lng: number;
  label: string;
  slug: string;
  image: string;
  neighborhood: string;
  cuisine: string;
  budget: string;
  rating: number;
};

type Props = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  style?: React.CSSProperties;
  fitToMarkers?: boolean;
};

export default function LeafletMap({ center, zoom = 13, markers = [], className, style, fitToMarkers = true }: Props) {
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

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const layer = L.layerGroup().addTo(map);
      layerRef.current = layer;

      // Click-to-expand delegation — close on map click
      map.on("click", () => {
        map.getContainer().querySelectorAll(".mcrd-wrap.is-open")
          .forEach((el) => el.classList.remove("is-open"));
      });

      // Let the browser finish layout before rendering markers
      requestAnimationFrame(() => {
        map.invalidateSize();
        renderMarkers(L, map, layer, markers, fitToMarkers);

        // Event delegation for pin clicks
        map.getContainer().addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          const pin = target.closest(".mcrd-pin");
          if (!pin) return;
          e.stopPropagation();
          const wrap = pin.closest(".mcrd-wrap");
          if (!wrap) return;
          map.getContainer().querySelectorAll(".mcrd-wrap.is-open").forEach((el) => {
            if (el !== wrap) el.classList.remove("is-open");
          });
          wrap.classList.toggle("is-open");
        }, true);
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
    renderMarkers(LRef.current, mapRef.current, layerRef.current, markers, fitToMarkers);
  }, [markers]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-center when center/zoom props change (e.g. city filter) ──
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom]);

  return (
    <div className={className} style={{ position: "relative", height: "100%", width: "100%", ...style }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

const PRICE_INFO: Record<string, { img: string; label: string; budget: string }> = {
  "$$":   { img: "/vespa-v2.png", label: "Vespa Sprint", budget: "€" },
  "$$$":  { img: "/plus-v2.png",  label: "Ape Plus",     budget: "€€" },
  "$$$$": { img: "/bombo-v2.png", label: "Bombo Queen",  budget: "€€€" },
};

function renderMarkers(
  L: typeof import("leaflet"),
  map: ReturnType<typeof import("leaflet")["map"]>,
  layer: ReturnType<typeof import("leaflet")["layerGroup"]>,
  markers: MapMarker[],
  fitToMarkers = true,
) {
  layer.clearLayers();
  if (markers.length === 0) return;

  markers.forEach(({ lat, lng, label, slug, image, neighborhood, cuisine, budget, rating }) => {
    const priceInfo = PRICE_INFO[budget];
    const html = `
      <div class="mcrd-wrap">
        <a class="mcrd" href="/restaurants/${slug}" onclick="event.stopPropagation()">
          <img class="mcrd__img" src="${image}" alt="${label}" />
          <div class="mcrd__body">
            <div class="mcrd__topline">
              <span class="mcrd__tag">${cuisine}</span>
              <strong class="mcrd__rating">★ ${rating.toFixed(1)}</strong>
            </div>
            <strong class="mcrd__name">${label}</strong>
            <span class="mcrd__hood">${neighborhood}</span>
            ${priceInfo ? `
            <div class="mcrd__budget">
              <img class="mcrd__budget-img" src="${priceInfo.img}" alt="" />
              <span class="mcrd__budget-label">${priceInfo.label}</span>
              <span class="mcrd__budget-symbol">${priceInfo.budget}</span>
            </div>` : ""}
            <span class="mcrd__cta">Prenota →</span>
          </div>
        </a>
        <div class="mcrd-pin">
          <span class="mcrd-pin__star">★</span>${rating.toFixed(1)}
        </div>
      </div>`;

    const icon = L.divIcon({
      html,
      className: "",
      iconSize: [170, 185],
      iconAnchor: [85, 185],
    });

    L.marker([lat, lng], { icon }).addTo(layer);
  });

  if (fitToMarkers && markers.length > 1) {
    const bounds = L.latLngBounds(markers.map(({ lat, lng }) => [lat, lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }
}
