"use client";

// Imagem da landing pública com fallback: se a URL falhar, o bloco some
// inteiro em vez de exibir o ícone de imagem quebrada do navegador.
import { useState } from "react";

type LandingImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function LandingImage({ src, alt, className }: LandingImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
