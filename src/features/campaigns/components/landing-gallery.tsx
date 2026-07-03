"use client";

// Galeria da landing pública — grade de miniaturas com lightbox em Dialog.
import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LandingImage } from "@/features/campaigns/components/landing-image";

type LandingGalleryProps = {
  images: string[];
  titulo: string;
};

export function LandingGallery({ images, titulo }: LandingGalleryProps) {
  const [openImage, setOpenImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <section aria-label="Galeria de imagens" className="space-y-4">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, index) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setOpenImage(url)}
              aria-label={`Ampliar imagem ${index + 1} de ${images.length}`}
              className="bg-muted focus-visible:ring-ring block w-full overflow-hidden rounded-lg border transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            >
              <LandingImage
                src={url}
                alt={`${titulo} — imagem ${index + 1}`}
                className="aspect-square h-auto w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={openImage !== null}
        onOpenChange={(open) => {
          if (!open) setOpenImage(null);
        }}
      >
        <DialogContent className="max-w-4xl p-2 sm:p-3">
          <DialogTitle className="sr-only">{titulo}</DialogTitle>
          {openImage ? (
            <LandingImage
              src={openImage}
              alt={titulo}
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
