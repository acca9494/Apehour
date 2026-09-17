import { NextResponse } from "next/server";

// Destinazione unica per QR code stampati (biglietti da visita, locandine…):
// il link stampato non cambia mai, solo questa riga. Oggi porta alla
// registrazione (l'utente sceglie lì se è cliente o locale); quando l'app
// sarà pronta basterà puntare questa route allo store (o a una pagina che
// rileva iOS/Android).
export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const url = new URL("/register", request.url);
  // Se il QR ha un tag evento (es. ?evento=aperitivo-lancio), lo passiamo
  // alla registrazione così viene salvato su chi si iscrive da lì.
  const evento = reqUrl.searchParams.get("evento");
  if (evento) url.searchParams.set("evento", evento);
  return NextResponse.redirect(url);
}
