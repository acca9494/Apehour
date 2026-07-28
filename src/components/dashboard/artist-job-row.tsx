import Link from "next/link";
import type { ArtistJob } from "@/lib/artist/store";
import { slugify } from "@/lib/utils";

export function JobRow({ job }: { job: ArtistJob }) {
  return (
    <Link href={`/restaurants/${slugify(job.venueName)}`} className="artist-job-row">
      <div className="artist-job-row__main">
        <strong>{job.title}</strong>
        <span>{job.venueName} · {job.city}</span>
      </div>
      <div className="artist-job-row__meta">
        <span className="artist-job-row__date">{job.date}</span>
        <span className="artist-job-row__compenso">€{job.compenso}</span>
      </div>
    </Link>
  );
}
