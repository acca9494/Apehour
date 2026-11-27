"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

function computeFitSize(naturalWidth: number, naturalHeight: number) {
  // visualViewport è più preciso di innerHeight su mobile quando la barra
  // indirizzi è visibile (innerHeight può includere area in realtà coperta).
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const maxW = Math.min(window.innerWidth * 0.9, 1200);
  const maxH = Math.min(viewportHeight * 0.75, 900);
  // Non ingrandiamo mai oltre la risoluzione reale della foto (causerebbe
  // sfocatura), solo rimpiccioliamo se non entra nello schermo.
  const scale = Math.min(1, maxW / naturalWidth, maxH / naturalHeight);
  return { width: naturalWidth * scale, height: naturalHeight * scale };
}

export function GalleryLightbox({ images, name }: { images: string[]; name: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [fitSize, setFitSize] = useState<{ width: number; height: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const isOpen = openIndex !== null;

  // Il portal richiede document.body, che non esiste durante il render
  // server: montiamo solo lato client.
  useEffect(() => setMounted(true), []);

  // Si riadatta anche se la finestra cambia dimensione/orientamento mentre
  // la foto è aperta.
  useEffect(() => {
    if (!isOpen) return;
    function handleResize() {
      const img = document.querySelector<HTMLImageElement>(".gallery-lightbox__img");
      if (img?.naturalWidth) setFitSize(computeFitSize(img.naturalWidth, img.naturalHeight));
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

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

  function openAt(i: number) {
    setFitSize(null);
    setOpenIndex(i);
  }

  function step(direction: 1 | -1) {
    setFitSize(null);
    setOpenIndex((i) => (i === null ? i : (i + direction + images.length) % images.length));
  }

  return (
    <>
      <div className="gallery-strip">
        {images.map((img, i) => (
          <button
            key={img + i}
            type="button"
            className="gallery-strip__tile"
            onClick={() => openAt(i)}
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

      {openIndex !== null && mounted && createPortal(
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
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Foto precedente"
            >
              ‹
            </button>
          )}

          <div className="gallery-lightbox__frame" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[openIndex]}
              alt={`${name} foto ${openIndex + 1}`}
              className="gallery-lightbox__img"
              style={fitSize ? { width: fitSize.width, height: fitSize.height } : { opacity: 0 }}
              onLoad={(e) => {
                const img = e.currentTarget;
                setFitSize(computeFitSize(img.naturalWidth, img.naturalHeight));
              }}
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
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Foto successiva"
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <span className="gallery-lightbox__counter">{openIndex + 1} / {images.length}</span>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
