"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { hasArtistProfile, saveArtistProfile } from "@/lib/artist/store";
import { cn } from "@/lib/utils";

const POSITIONS = ["DJ set", "Musicista live", "Performer", "Bartender flair", "Cameriere/a", "Barista", "Altro"];
const CITIES = ["Roma", "Ostia", "Fregene", "Ladispoli"];

const SUB_NAV = [
  { href: "/profile/apejobs",              label: "Dashboard ApeJobs" },
  { href: "/profile/apejobs/cerca-lavoro", label: "Cerca lavoro" },
  { href: "/profile/apejobs/pagamenti",    label: "Pagamenti" },
];

export default function ApeJobsLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [activated, setActivated] = useState<boolean | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvDataUrl, setCvDataUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setActivated(hasArtistProfile(user.id));
    const [fn, ...rest] = user.name.split(" ");
    setFirstName(fn ?? "");
    setLastName(rest.join(" "));
  }, [user]);

  if (!user || activated === null) return null;

  function readFile(file: File) {
    setCvFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCvDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  if (!activated) {
    function handleActivate(e: React.FormEvent) {
      e.preventDefault();
      if (!user) return;
      saveArtistProfile({
        userId: user.id,
        firstName,
        lastName,
        discipline: position || POSITIONS[0]!,
        city: city || CITIES[0]!,
        bio,
        cvFileName: cvFileName ?? undefined,
        cvDataUrl: cvDataUrl ?? undefined,
      });
      setActivated(true);
    }

    return (
      <div className="dashboard-page-header">
        <p className="eyebrow">ApeJobs</p>
        <h1>Attiva ApeJobs</h1>
        <p>Compila qualche informazione per iniziare a cercare lavoro e ricevere pagamenti dai locali.</p>

        <form className="auth-form" style={{ maxWidth: 420, marginTop: "1.5rem" }} onSubmit={handleActivate}>
          <label>
            Nome
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Mario" required />
          </label>
          <label>
            Cognome
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Rossi" required />
          </label>
          <label>
            Posizione lavorativa
            <select value={position} onChange={(e) => setPosition(e.target.value)} required>
              <option value="" disabled>Seleziona…</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            Città
            <select value={city} onChange={(e) => setCity(e.target.value)} required>
              <option value="" disabled>Seleziona…</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Descrizione <span style={{ fontWeight: 400, textTransform: "none" }}>(facoltativa)</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Racconta la tua esperienza in poche righe…" rows={3} />
          </label>

          <div>
            <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>CV</span>
            <div
              className={cn("apejobs-cv-drop", dragOver && "is-dragover")}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {cvFileName ? (
                <span>📄 {cvFileName}</span>
              ) : (
                <span>Trascina qui il tuo CV, o clicca per selezionarlo</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }}
            />
          </div>

          <button type="submit" className="mreg__btn mreg__btn--primary">Attiva ApeJobs</button>
        </form>
      </div>
    );
  }

  return (
    <div className="apejobs-page">
      <div className="apejobs-subnav">
        {SUB_NAV.map((item) => {
          const active = item.href === "/profile/apejobs" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("apejobs-subnav__item", active && "is-active")}>
              {item.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
