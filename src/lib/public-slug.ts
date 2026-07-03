// Slug público de campanhas — geração e validação do identificador da landing
// page "Saiba mais" e construção da URL pública absoluta.
import { randomUUID } from "node:crypto";

import { z } from "zod";

/// Formato do slug: 32 caracteres hexadecimais (UUID v4 sem hífens).
export const publicSlugSchema = z
  .string()
  .regex(/^[a-f0-9]{32}$/, "Slug inválido");

/// Gera um slug não adivinhável (122 bits de aleatoriedade).
export function generatePublicSlug(): string {
  return randomUUID().replace(/-/g, "");
}

/// URL base da aplicação para montar links absolutos em emails/WhatsApp.
export function getAppBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return (base || "http://localhost:3000").replace(/\/+$/, "");
}

/// URL pública da landing page de uma campanha.
export function buildCampaignPublicUrl(slug: string): string {
  return `${getAppBaseUrl()}/c/${slug}`;
}
