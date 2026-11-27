"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function GalleryLightbox({ images, name }: { images: string[]; name: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [openIndex, images.length]);

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
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={() => setOpenIndex(null)}
            aria-label="Chiudi"
          >
            ✕
          </button>

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

          <div className="gallery-lightbox__img-wrap" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[openIndex]}
              alt={`${name} foto ${openIndex + 1}`}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              priority
            />
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
