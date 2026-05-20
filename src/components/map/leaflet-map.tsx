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

export default function LeafletMap({ center, zoom = 14, markers = [], className, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const el = containerRef.current;

    import("@maptiler/sdk").then((sdk) => {
      if (mapRef.current || !el) return;

      sdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

      const map = new sdk.Map({
        container: el,
        style: sdk.MapStyle.STREETS,
        center: [center.lng, center.lat],
        zoom,
      });

      mapRef.current = map;

      // Add navigation control the correct way
      map.addControl(new sdk.NavigationControl(), "bottom-right");

      map.on("load", () => {
        markers.forEach(({ lat, lng, label, popupHtml }, i) => {
          const pill = document.createElement("div");
          pill.className = "ape-pill";
          pill.textContent = label ?? String(i + 1);

          const marker = new sdk.Marker({ element: pill })
            .setLngLat([lng, lat])
            .addTo(map);

          if (popupHtml) {
            const popup = new sdk.Popup({
              closeButton: false,
              offset: 14,
              className: "ape-popup-wrap",
            }).setHTML(`<div class="ape-popup">${popupHtml}</div>`);

            marker.setPopup(popup);

            pill.addEventListener("click", () => {
              document.querySelectorAll(".ape-pill").forEach((p) => p.classList.remove("is-active"));
              pill.classList.add("is-active");
            });
          }
        });

        if (markers.length > 1) {
          const bounds = new sdk.LngLatBounds();
          markers.forEach(({ lng, lat }) => bounds.extend([lng, lat]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 0 });
        }
      });
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: "100%", width: "100%", minHeight: "200px", ...style }}
    />
  );
}
