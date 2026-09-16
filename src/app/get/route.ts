import { NextResponse } from "next/server";

// Destinazione unica per QR code stampati (biglietti da visita, locandine…):
// il link stampato non cambia mai, solo questa riga. Oggi porta alla
// registrazione commerciante; quando l'app sarà pronta basterà puntare
// questa route allo store (o a una pagina che rileva iOS/Android).
export async function GET(request: Request) {
  const url = new URL("/register?mode=commerciante&ref=founding", request.url);
  return NextResponse.redirect(url);
}
