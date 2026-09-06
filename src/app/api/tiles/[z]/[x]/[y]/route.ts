import { NextResponse } from "next/server";

// Proxy verso MapTiler: la chiave resta lato server, non viene mai inviata al browser.
// Il client (Leaflet) chiede le tile a /api/tiles/{z}/{x}/{y}.png, questa route
// allega la chiave server-side e inoltra l'immagine, con cache aggressiva.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params;
  const key = process.env.MAPTILER_KEY;
  const yClean = y.replace(/\.png$/, "");

  if (!key) {
    return NextResponse.json({ error: "Map tiles not configured" }, { status: 503 });
  }

  const upstream = await fetch(
    `https://api.maptiler.com/maps/streets-v2/256/${z}/${x}/${yClean}.png?key=${key}`
  );

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Tile fetch failed" }, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, immutable",
    },
  });
}
