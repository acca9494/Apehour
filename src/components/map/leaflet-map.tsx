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

    import("@maptiler/sdk").then((maptiler) => {
      if (mapRef.current || !containerRef.current) return;

      maptiler.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

      const map = new maptiler.Map({
        container: containerRef.current,
        style: maptiler.MapStyle.STREETS,
        center: [center.lng, center.lat],
        zoom,
        navigationControl: "bottom-right",
      });

      mapRef.current = map;

      map.on("load", () => {
        markers.forEach(({ lat, lng, label, popupHtml }, i) => {
          const pillLabel = label ?? `${i + 1}`;

          const el = document.createElement("div");
          el.className = "ape-pill";
          el.textContent = pillLabel;

          const marker = new maptiler.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);

          if (popupHtml) {
            const popup = new maptiler.Popup({
              closeButton: false,
              offset: 12,
              className: "ape-popup-wrap",
            }).setHTML(`<div class="ape-popup">${popupHtml}</div>`);

            marker.setPopup(popup);

            el.addEventListener("click", () => {
              document.querySelectorAll(".ape-pill").forEach((p) => p.classList.remove("is-active"));
              el.classList.add("is-active");
              popup.addTo(map);
            });
          }
        });

        // Fit all markers
        if (markers.length > 1) {
          const { LngLatBounds } = maptiler;
          const bounds = new LngLatBounds();
          markers.forEach(({ lng, lat }) => bounds.extend([lng, lat]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
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
      style={{ height: "100%", width: "100%", ...style }}
    />
  );
}
