"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function GalleryLightbox({ images, name }: { images: string[]; name: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  // Blocca lo scroll di sfondo solo all'apertura/chiusura, non ad ogni
  // cambio foto: prima si riapplicava position:fixed ad ogni click
  // successiva/precedente, causando un salto visibile che sembrava un
  // ritorno alla pagina del locale.
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      // Azzera sempre (non "ripristina il valore di prima"): salvare e
      // riapplicare il valore precedente poteva ri-bloccare lo scroll in modo
      // permanente se quel valore era già "fixed" per qualche motivo. Il sito
      // non usa altrove questi stili sul body, quindi azzerare è sicuro.
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, images.length]);

  return (
    <>
      <div className="gallery-strip">
        {images.map((img, i) => (
          <button
            key={img + i}
            type="button"
            className="gallery-strip__tile"
            onClick={() => setOpenIndex(i)}
            aria-label={`Ingrandisci foto ${i + 1} di ${name}`}
          >
            <Image
              src={img}
              alt={`${name} foto ${i + 1}`}
              fill
              sizes="(max-width: 760px) 80vw, 30vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${openIndex + 1} di ${name}`}
          onClick={() => setOpenIndex(null)}
        >
          {images.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--prev"
              onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)); }}
              aria-label="Foto precedente"
            >
              ‹
            </button>
          )}

          <div className="gallery-lightbox__frame" onClick={(e) => e.stopPropagation()}>
            <Image
              key={images[openIndex]}
              src={images[openIndex]}
              alt={`${name} foto ${openIndex + 1}`}
              width={2400}
              height={2400}
              unoptimized
              className="gallery-lightbox__img"
              priority
            />
            <button
              type="button"
              className="gallery-lightbox__close"
              onClick={() => setOpenIndex(null)}
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i === null ? i : (i + 1) % images.length)); }}
              aria-label="Foto successiva"
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <span className="gallery-lightbox__counter">{openIndex + 1} / {images.length}</span>
          )}
        </div>
      )}
    </>
  );
}
