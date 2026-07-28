// ─────────────────────────────────────────────────────────────────────────────
//  Annunci "disponibile per lavoro" pubblicati dagli artisti (mock)
//  Si affiancano ai AVAILABLE_ARTISTS di esempio, visibili ai locali in ApeJobs.
// ─────────────────────────────────────────────────────────────────────────────

import { AVAILABLE_ARTISTS as DEFAULT_ARTISTS, type AvailableArtist } from "@/lib/data/artists";

const KEY = "appape_posted_artist_listings";

export type PostedArtistListing = AvailableArtist & { userId: string };

function readPosted(): PostedArtistListing[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PostedArtistListing[]) : [];
  } catch {
    return [];
  }
}

function writePosted(list: PostedArtistListing[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getAllAvailableArtists(): (AvailableArtist | PostedArtistListing)[] {
  return [...DEFAULT_ARTISTS, ...readPosted()];
}

export function getMyArtistListing(userId: string): PostedArtistListing | undefined {
  return readPosted().find((a) => a.userId === userId);
}

export function upsertArtistListing(entry: PostedArtistListing): void {
  const posted = readPosted();
  const idx = posted.findIndex((a) => a.userId === entry.userId);
  if (idx === -1) posted.push(entry);
  else posted[idx] = entry;
  writePosted(posted);
}

export function removeArtistListing(userId: string): void {
  writePosted(readPosted().filter((a) => a.userId !== userId));
}
