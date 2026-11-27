"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import {
  listGalleryImages,
  addGalleryImage,
  removeGalleryImage,
  reorderGalleryImages,
  type GalleryImage,
  type ImageCategory,
} from "@/lib/restaurants/gallery";

export function PhotoManager({
  restaurantId,
  category,
  title,
  hint,
}: {
  restaurantId: string;
  category: ImageCategory;
  title: string;
  hint: string;
}) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    listGalleryImages(restaurantId, category)
      .then(setImages)
      .finally(() => setLoading(false));
  }, [restaurantId, category]);

  async function handleAdd(url: string) {
    setUploading(true);
    try {
      const img = await addGalleryImage(restaurantId, url, category);
      setImages((prev) => [...prev, img]);
    } catch {
      alert("Non è stato possibile aggiungere la foto. Riprova.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(id: string) {
    const prev = images;
    setImages((list) => list.filter((img) => img.id !== id));
    try {
      await removeGalleryImage(id);
    } catch {
      setImages(prev);
      alert("Non è stato possibile rimuovere la foto. Riprova.");
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setImages(next);
    try {
      await reorderGalleryImages(next);
    } catch {
      alert("Non è stato possibile riordinare le foto. Riprova.");
    }
  }

  return (
    <div className="settings-form__full">
      <span className="auth-form__label" style={{ display: "block", marginBottom: "0.5rem" }}>
        {title}
      </span>
      <p className="settings-hint" style={{ marginTop: 0 }}>{hint}</p>

      {loading ? (
        <p className="settings-hint">Caricamento…</p>
      ) : (
        <div className="settings-gallery">
          {images.map((img, i) => (
            <div key={img.id} className="settings-gallery__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" />
              <button
                type="button"
                className="settings-gallery__remove"
                onClick={() => handleRemove(img.id)}
                aria-label="Rimuovi foto"
              >
                ✕
              </button>
              <div className="settings-gallery__reorder">
                <button
                  type="button"
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  aria-label="Sposta indietro"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 1)}
                  disabled={i === images.length - 1}
                  aria-label="Sposta avanti"
                >
                  ▶
                </button>
              </div>
            </div>
          ))}
          <div className="settings-gallery__add">
            <ImageUploadField label="" value="" onChange={handleAdd} />
          </div>
        </div>
      )}
      {uploading && <p className="settings-hint">Aggiunta foto…</p>}
    </div>
  );
}
