"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "./leaflet-map";

const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false });

type Props = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  style?: React.CSSProperties;
};

export function MapClient(props: Props) {
  return <LeafletMap {...props} />;
}
