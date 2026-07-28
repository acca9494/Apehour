// ─────────────────────────────────────────────────────────────────────────────
//  Candidature agli annunci di lavoro (mock, condivise sul browser)
//  Un artista si candida a un AreaJob; il locale vede le candidature ricevute.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = "appape_job_applications";

export interface JobApplication {
  jobId: string;
  artistUserId: string;
  artistName: string;
  discipline: string;
  city: string;
  appliedAt: string;
}

function readAll(): JobApplication[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as JobApplication[]) : [];
  } catch {
    return [];
  }
}

function writeAll(apps: JobApplication[]): void {
  localStorage.setItem(KEY, JSON.stringify(apps));
}

export function getApplications(): JobApplication[] {
  return readAll();
}

export function getApplicationsForArtist(artistUserId: string): JobApplication[] {
  return readAll().filter((a) => a.artistUserId === artistUserId);
}

export function applyToJob(app: JobApplication): JobApplication[] {
  const all = readAll();
  if (all.some((a) => a.jobId === app.jobId && a.artistUserId === app.artistUserId)) return all;
  const next = [...all, app];
  writeAll(next);
  return next;
}

export function withdrawApplication(jobId: string, artistUserId: string): JobApplication[] {
  const next = readAll().filter((a) => !(a.jobId === jobId && a.artistUserId === artistUserId));
  writeAll(next);
  return next;
}
