"use client";

import { useEffect, useRef } from "react";
import type * as MaptilerSDK from "@maptiler/sdk";

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

const MAP_STYLE_URL = `https://api.maptiler.com/maps/019e4581-2447-72a7-989f-09082cf76c75/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

export default function LeafletMap({ center, zoom = 14, markers = [], className, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaptilerSDK.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    import("@maptiler/sdk").then((sdk) => {
      if (mapRef.current || !containerRef.current) return;

      sdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

      const map = new sdk.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [center.lng, center.lat],
        zoom,
      });

      mapRef.current = map;

      map.addControl(new sdk.NavigationControl({ visualizePitch: true }), "bottom-right");

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
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className} style={{ position: "relative", height: "100%", width: "100%", ...style }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
