export const LAZIO_CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  "Roma": { lat: 41.9028, lng: 12.4964 },
  "Ostia": { lat: 41.7313, lng: 12.2887 },
  "Fregene": { lat: 41.8283, lng: 12.2015 },
  "Ladispoli": { lat: 41.956, lng: 12.0745 },
  "Fiumicino": { lat: 41.7707, lng: 12.2349 },
  "Frascati": { lat: 41.8080, lng: 12.6809 },
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Calcolo interamente lato client (nessuna chiamata a un servizio di
// geocoding esterno): le 4 città coperte sono poche e fisse, quindi basta
// la distanza in linea d'aria dal punto rilevato al centro di ciascuna.
export function nearestLazioCity(point: { lat: number; lng: number }): string {
  let best = "Roma";
  let bestDist = Infinity;
  for (const [city, center] of Object.entries(LAZIO_CITY_CENTERS)) {
    const d = haversineKm(point, center);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best;
}
