"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getArtistProfile, saveArtistProfile } from "@/lib/artist/store";
import { cn } from "@/lib/utils";

const POSITIONS = ["DJ set", "Musicista live", "Performer", "Bartender flair", "Cameriere/a", "Barista", "Altro"];
const CITIES = ["Roma", "Ostia", "Fregene", "Ladispoli"];

export default function ApeJobsImpostazioniPage() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvDataUrl, setCvDataUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const profile = getArtistProfile(user.id);
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPosition(profile.discipline);
    setCity(profile.city);
    setBio(profile.bio);
    setCvFileName(profile.cvFileName ?? null);
    setCvDataUrl(profile.cvDataUrl ?? null);
  }, [user]);

  if (!user) return null;

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

  function handleSave(e: React.FormEvent) {
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="dashboard-page-header">
      <p className="eyebrow">ApeJobs</p>
      <h1>Impostazioni profilo</h1>
      <p>Modifica le tue informazioni e il CV visibili ai locali quando candidi.</p>

      <form className="auth-form" style={{ maxWidth: 420, marginTop: "1.5rem" }} onSubmit={handleSave}>
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

        <button type="submit" className="mreg__btn mreg__btn--primary">
          {saved ? "Salvato ✓" : "Salva modifiche"}
        </button>
      </form>
    </div>
  );
}
