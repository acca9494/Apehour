"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { getVenueSettings } from "@/lib/merchant/store";
import { getApplications, type JobApplication } from "@/lib/artist/applications";
import { getArtistPayments, type ArtistPayment } from "@/lib/merchant/artist-payments";
import { getAllAreaJobs, type PostedAreaJob } from "@/lib/jobs/area-jobs-store";

export default function ApeJobsMerchantOverviewPage() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<PostedAreaJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [payments, setPayments] = useState<ArtistPayment[]>([]);
  const [venueName, setVenueName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const settings = getVenueSettings(user.id);
    setVenueName(settings.name);
    setMyEvents(getAllAreaJobs().filter((j) => j.venueName === settings.name || j.postedBy === user.id));
    setApplications(getApplications());
    setPayments(getArtistPayments(user.id));
  }, [user]);

  if (!user) return null;

  const myEventIds = new Set(myEvents.map((e) => e.id));
  const candidatesCount = applications.filter((a) => myEventIds.has(a.jobId)).length;
  const totalPaid = payments.filter((p) => p.status === "Pagato").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="dash-overview">

      <div className="dash-overview__header">
        <div>
          <p className="dash-overview__date">ApeJobs</p>
          <h1 className="dash-overview__title">Panoramica assunzioni{venueName ? ` — ${venueName}` : ""}</h1>
        </div>
        <Link href="/dashboard/artisti/offerte" className="clay-button clay-button--secondary dash-overview__cta">
          Pubblica un&apos;offerta di lavoro
        </Link>
      </div>

      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <span className="dash-kpi-card__icon">📋</span>
          <span className="dash-kpi-card__label">Offerte pubblicate</span>
          <span className="dash-kpi-card__value">{myEvents.length}</span>
          <span className="dash-kpi-card__sub">in programma</span>
        </div>
        <div className="dash-kpi-card">
          <span className="dash-kpi-card__icon">🧑‍🎤</span>
          <span className="dash-kpi-card__label">Candidature ricevute</span>
          <span className="dash-kpi-card__value">{candidatesCount}</span>
          <span className="dash-kpi-card__sub">sulle tue offerte</span>
        </div>
        <div className="dash-kpi-card">
          <span className="dash-kpi-card__icon">💶</span>
          <span className="dash-kpi-card__label">Pagamenti effettuati</span>
          <span className="dash-kpi-card__value dash-kpi-card__value--gold">€{totalPaid}</span>
          <span className="dash-kpi-card__sub">{payments.filter((p) => p.status === "In attesa").length} in attesa</span>
        </div>
      </div>

      <div className="dash-overview__quick-links">
        <Link href="/dashboard/artisti/offerte" className="attivita-join-btn">
          Vai a &quot;Le mie offerte di lavoro&quot; →
        </Link>
        <Link href="/dashboard/artisti/pagamenti" className="attivita-join-btn is-joined">
          Vai a &quot;Pagamenti&quot; →
        </Link>
      </div>

    </div>
  );
}
