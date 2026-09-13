"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "uploads";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    if (file.size > MAX_SIZE_BYTES) {
      setError("Immagine troppo grande (max 5MB)");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi essere loggato per caricare un'immagine");

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Caricamento fallito");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>{label}</span>
      <div
        className={`apejobs-cv-drop${dragOver ? " is-dragover" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={value ? { padding: 0, overflow: "hidden", border: "1.5px solid var(--border)" } : undefined}
      >
        {uploading ? (
          <span>Caricamento…</span>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
        ) : (
          <span>Trascina qui un&apos;immagine, o clicca per selezionarla dal PC</span>
        )}
      </div>
      {error && <p style={{ color: "#e04c4c", fontSize: "0.8rem", marginTop: "0.4rem" }}>{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
      />
    </div>
  );
}
