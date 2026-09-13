"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { MarkerClusterGroup } from "leaflet";

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
  const layerRef     = useRef<MarkerClusterGroup | null>(null);

  // ── Init map once ────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let cancelled = false;

    import("leaflet").then(async (mod) => {
      if (cancelled || mapRef.current || !containerRef.current) return;
      const L = mod.default ?? mod;
      LRef.current = L;

      // leaflet.markercluster è un plugin UMD scritto per l'uso con <script>:
      // internamente si aspetta Leaflet su window.L, non lo importa come
      // modulo. Senza questo, il suo caricamento falliva con "L is not
      // defined" — un crash silenzioso che a seconda del momento in cui
      // avveniva lasciava la mappa a metà inizializzata (a volte senza
      // marker, a volte senza il layer di clustering), dando l'impressione
      // di un comportamento "casuale" sui click.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).L = L;
      await import("leaflet.markercluster");
      // Il componente potrebbe essere stato smontato (es. doppio mount di
      // React StrictMode in sviluppo) mentre questi import erano in corso:
      // ricontrolla prima di creare la mappa, altrimenti Leaflet lancia
      // "Map container is already initialized" al mount successivo.
      if (cancelled || mapRef.current || !containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current!, { zoomControl: false })
        .setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer("/api/tiles/{z}/{x}/{y}.png", {
        attribution: "© MapTiler © OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Raggruppa i pallini vicini in un cluster con contatore: a zoom basso
      // più locali ravvicinati (es. centro di Roma) finiscono altrimenti
      // sovrapposti sullo schermo, coprendosi a vicenda e rendendo cliccabile
      // solo quello disegnato sopra — da qui la sensazione di click "a caso".
      const layer = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        // Senza animazione, i pin vengono posizionati subito al valore
        // finale invece di scorrere lì con una transizione CSS: con
        // l'animazione attiva c'era una finestra di alcune centinaia di ms,
        // subito dopo uno zoom o l'apertura di un cluster, in cui la
        // posizione "vera" del pin (dove il click viene davvero registrato)
        // non corrispondeva ancora a dove il browser lo riportava — un click
        // fatto in quella finestra cadeva sulla mappa invece che sul pin.
        animate: false,
      }).addTo(map);
      layerRef.current = layer;

      // Let the browser finish layout before rendering markers
      requestAnimationFrame(() => {
        map.invalidateSize();
        renderMarkers(L, map, layer, markers, fitToMarkers);

        // Un solo gestore, in capture phase, per aprire/chiudere le card.
        // Prima c'era anche un map.on("click", ...) separato di Leaflet per
        // richiudere tutto: Leaflet però ripropaga i click sui marker anche
        // internamente al proprio sistema di eventi (non solo via DOM), a
        // prescindere da stopPropagation — quel secondo gestore poteva quindi
        // richiudere la card appena aperta subito dopo, in modo incoerente
        // (a volte prima del repaint, a volte dopo), dando l'impressione che
        // il click funzionasse "a caso". Unificando tutto qui non c'è più
        // nessun altro listener che possa richiudere in modo indipendente.
        const container = map.getContainer();
        container.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          const pin = target.closest(".mcrd-pin");

          if (!pin) {
            container.querySelectorAll(".mcrd-wrap.is-open").forEach((el) => el.classList.remove("is-open"));
            return;
          }

          e.stopPropagation();
          const wrap = pin.closest(".mcrd-wrap");
          if (!wrap) return;
          container.querySelectorAll(".mcrd-wrap.is-open").forEach((el) => {
            if (el !== wrap) el.classList.remove("is-open");
          });
          wrap.classList.toggle("is-open");
        }, true);
      });
    });

    return () => {
      cancelled = true;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkers(
  L: typeof import("leaflet"),
  map: ReturnType<typeof import("leaflet")["map"]>,
  layer: MarkerClusterGroup,
  markers: MapMarker[],
  fitToMarkers = true,
) {
  layer.clearLayers();
  if (markers.length === 0) return;

  markers.forEach(({ lat, lng, label, slug, image, neighborhood, cuisine, budget, rating }) => {
    const priceInfo = PRICE_INFO[budget];
    const safeLabel = escapeHtml(label);
    const safeSlug = escapeHtml(slug);
    const safeImage = escapeHtml(image);
    const safeNeighborhood = escapeHtml(neighborhood);
    const safeCuisine = escapeHtml(cuisine);
    const html = `
      <div class="mcrd-wrap">
        <a class="mcrd" href="/restaurants/${safeSlug}" onclick="event.stopPropagation()">
          <img class="mcrd__img" src="${safeImage}" alt="${safeLabel}" />
          <div class="mcrd__body">
            <div class="mcrd__topline">
              <span class="mcrd__tag">${safeCuisine}</span>
              <strong class="mcrd__rating">★ ${rating.toFixed(1)}</strong>
            </div>
            <strong class="mcrd__name">${safeLabel}</strong>
            <span class="mcrd__hood">${safeNeighborhood}</span>
            ${priceInfo ? `
            <div class="mcrd__budget">
              <img class="mcrd__budget-img" src="${escapeHtml(priceInfo.img)}" alt="" />
              <span class="mcrd__budget-label">${escapeHtml(priceInfo.label)}</span>
              <span class="mcrd__budget-symbol">${escapeHtml(priceInfo.budget)}</span>
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

    // interactive:false è la vera correzione del click "a caso": di default
    // Leaflet rende cliccabile TUTTO il riquadro da 170x185px del divIcon
    // (leaflet-marker-icon ha pointer-events:auto), non solo il pin visibile
    // — il nostro .mcrd-wrap con pointer-events:none è un div ANNIDATO
    // dentro quello di Leaflet, quindi non lo disattiva. Quando due locali
    // sono vicini, il riquadro invisibile di quello con z-index più alto
    // (Leaflet ordina i marker per posizione verticale) vince il click anche
    // sopra il pin visibile dell'altro locale. Disattivando l'interattività
    // del riquadro di Leaflet, restano cliccabili solo mcrd-pin/mcrd (che
    // hanno pointer-events:all esplicito e quindi restano attivi anche con
    // l'antenato non interattivo).
    L.marker([lat, lng], { icon, interactive: false }).addTo(layer);
  });

  if (fitToMarkers && markers.length > 1) {
    const bounds = L.latLngBounds(markers.map(({ lat, lng }) => [lat, lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }
}
