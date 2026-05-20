"use client";

import { useEffect, useRef } from "react";

export type MapMarker = {
  lat: number;
  lng: number;
  label?: string;
  popupHtml?: string;
};

type Props = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  style?: React.CSSProperties;
};

export default function LeafletMap({ center, zoom = 13, markers = [], className, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let L: typeof import("leaflet");
    let map: ReturnType<typeof import("leaflet")["map"]>;

    import("leaflet").then((mod) => {
      if (mapRef.current || !containerRef.current) return;
      L = mod.default ?? mod;

      // Fix default icon paths broken by bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(containerRef.current!, { zoomControl: false }).setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      markers.forEach(({ lat, lng, label, popupHtml }) => {
        const icon = L.divIcon({
          html: `<div class="ape-pill">${label ?? "•"}</div>`,
          className: "",
          iconAnchor: [20, 20],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        if (popupHtml) {
          marker.bindPopup(`<div class="ape-popup">${popupHtml}</div>`, {
            closeButton: false,
            offset: [0, -14],
          });
          marker.on("click", () => {
            document.querySelectorAll(".ape-pill").forEach((p) => p.classList.remove("is-active"));
            marker.getElement()?.querySelector(".ape-pill")?.classList.add("is-active");
          });
        }
      });

      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map(({ lat, lng }) => [lat, lng] as [number, number]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
      }
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as ReturnType<typeof import("leaflet")["map"]>).remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div className={className} style={{ position: "relative", height: "100%", width: "100%", ...style }}>
        <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      </div>
    </>
  );
}
