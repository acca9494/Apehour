// ─────────────────────────────────────────────────────────────────────────────
//  Annunci di lavoro pubblicati dai locali (mock — sostituire con backend)
//  Si affiancano ai DEFAULT_AREA_JOBS di esempio.
// ─────────────────────────────────────────────────────────────────────────────

import { AREA_JOBS as DEFAULT_AREA_JOBS, type AreaJob } from "@/lib/data/area-jobs";

const KEY = "appape_posted_area_jobs";

export type PostedAreaJob = AreaJob & { postedBy?: string };

function readPosted(): PostedAreaJob[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PostedAreaJob[]) : [];
  } catch {
    return [];
  }
}

function writePosted(jobs: PostedAreaJob[]): void {
  localStorage.setItem(KEY, JSON.stringify(jobs));
}

export function getAllAreaJobs(): PostedAreaJob[] {
  return [...DEFAULT_AREA_JOBS, ...readPosted()];
}

export function postAreaJob(job: Omit<PostedAreaJob, "id">): PostedAreaJob {
  const posted = readPosted();
  const newJob: PostedAreaJob = {
    ...job,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  writePosted([...posted, newJob]);
  return newJob;
}

export function deleteAreaJob(id: string, postedBy: string): PostedAreaJob[] {
  const next = readPosted().filter((j) => !(j.id === id && j.postedBy === postedBy));
  writePosted(next);
  return next;
}
