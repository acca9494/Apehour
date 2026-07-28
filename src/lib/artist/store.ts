// ─────────────────────────────────────────────────────────────────────────────
//  Artist localStorage store (mock — sostituire con backend reale)
//  Gestisce: profilo artista, lavori fatti/in programma, likes, rating a stelle
// ─────────────────────────────────────────────────────────────────────────────

export interface ArtistProfile {
  userId: string;
  firstName: string;
  lastName: string;
  discipline: string;   // posizione lavorativa, es. "DJ set", "Cameriere", "Barista"
  city: string;
  rate?: string;
  bio: string;           // descrizione, opzionale
  cvFileName?: string;
  cvDataUrl?: string;
}

export interface ArtistJob {
  id: string;
  title: string;
  venueName: string;
  city: string;
  date: string;
  compenso: number;
}

function profileKey(uid: string)  { return `appape_artist_profile_${uid}`; }
function jobsDoneKey(uid: string) { return `appape_artist_jobs_done_${uid}`; }
function jobsUpKey(uid: string)   { return `appape_artist_jobs_upcoming_${uid}`; }
function likesKey(uid: string)    { return `appape_artist_likes_${uid}`; }
function ratingsKey(uid: string)  { return `appape_artist_ratings_${uid}`; }

const DEFAULT_PROFILE: Omit<ArtistProfile, "userId"> = {
  firstName: "",
  lastName: "",
  discipline: "DJ set",
  city: "Milano",
  bio: "",
};

const DEFAULT_JOBS_DONE: ArtistJob[] = [
  { id: "jd-1", title: "DJ set aperitivo estivo", venueName: "Spritz Brera",    city: "Milano", date: "12 Apr 2026", compenso: 180 },
  { id: "jd-2", title: "Serata jazz acustica",     venueName: "Terrazza Monti", city: "Roma",   date: "28 Mar 2026", compenso: 220 },
  { id: "jd-3", title: "DJ set rooftop",           venueName: "Oltrarno Negroni", city: "Firenze", date: "15 Mar 2026", compenso: 150 },
];

const DEFAULT_JOBS_UPCOMING: ArtistJob[] = [
  { id: "ju-1", title: "DJ set Negroni Week",  venueName: "Negroni House",   city: "Torino", date: "5 Giu 2026", compenso: 200 },
  { id: "ju-2", title: "Live set aperitivo",   venueName: "Bacaro Rialto",   city: "Venezia", date: "8 Giu 2026", compenso: 170 },
];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function getArtistProfile(userId: string): ArtistProfile {
  return readJSON(profileKey(userId), { userId, ...DEFAULT_PROFILE });
}

export function saveArtistProfile(profile: ArtistProfile): void {
  localStorage.setItem(profileKey(profile.userId), JSON.stringify(profile));
}

export function hasArtistProfile(userId: string): boolean {
  try {
    return localStorage.getItem(profileKey(userId)) !== null;
  } catch {
    return false;
  }
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export function getJobsDone(userId: string): ArtistJob[] {
  return readJSON(jobsDoneKey(userId), DEFAULT_JOBS_DONE);
}

export function getJobsUpcoming(userId: string): ArtistJob[] {
  return readJSON(jobsUpKey(userId), DEFAULT_JOBS_UPCOMING);
}

// ── Likes ────────────────────────────────────────────────────────────────────

export function getLikes(userId: string): number {
  return readJSON(likesKey(userId), 42);
}

export function addLike(userId: string): number {
  const current = getLikes(userId) + 1;
  localStorage.setItem(likesKey(userId), JSON.stringify(current));
  return current;
}

// ── Ratings (1-5 stelle) ─────────────────────────────────────────────────────

export function getRatings(userId: string): number[] {
  return readJSON(ratingsKey(userId), [5, 4, 5, 5, 4, 5, 3, 5]);
}

export function addRating(userId: string, stars: number): number[] {
  const ratings = [...getRatings(userId), stars];
  localStorage.setItem(ratingsKey(userId), JSON.stringify(ratings));
  return ratings;
}

export function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}
