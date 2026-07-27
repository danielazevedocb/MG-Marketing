// Validação compartilhada de URLs — usada em campanhas e templates.
import { z } from "zod";

/**
 * `z.url()`/`.url()` aceita qualquer esquema válido de URL, incluindo
 * `javascript:`/`data:`/`vbscript:`. Como essas URLs podem acabar em `href`
 * (CTA de campanha, botão de template), restringimos a http/https.
 */
export function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

const HTTP_PROTOCOL_MESSAGE = "URL deve começar com http:// ou https://";

/** URL obrigatória, restrita a http/https. */
export function httpUrlSchema(invalidMessage = "URL inválida") {
  return z
    .string()
    .trim()
    .url(invalidMessage)
    .refine(isHttpUrl, HTTP_PROTOCOL_MESSAGE);
}

/** URL opcional (ou string vazia), restrita a http/https quando presente. */
export function optionalHttpUrlSchema(invalidMessage = "URL inválida") {
  return httpUrlSchema(invalidMessage).optional().or(z.literal(""));
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

const YOUTUBE_VIDEO_ID_PATTERN = /^[\w-]{11}$/;

/**
 * Extrai o ID de 11 caracteres de um link de vídeo do YouTube, aceitando
 * apenas os domínios legítimos do YouTube e os formatos comuns
 * (watch?v=, youtu.be/, embed/, shorts/). Retorna null para qualquer URL
 * que não seja reconhecidamente do YouTube — nunca tenta "adivinhar" um ID
 * a partir de outro formato/host. Usado tanto na validação do formulário
 * (schemas/campaign.ts) quanto na reconstrução segura do embed exibido na
 * landing pública (services/channel-content.ts), garantindo o mesmo
 * critério de "é um vídeo do YouTube válido" nos dois lugares.
 */
export function extractYouTubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const host = parsed.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (parsed.pathname === "/watch") {
    candidate = parsed.searchParams.get("v");
  } else if (parsed.pathname.startsWith("/embed/")) {
    candidate = parsed.pathname.slice("/embed/".length).split("/")[0] ?? null;
  } else if (parsed.pathname.startsWith("/shorts/")) {
    candidate = parsed.pathname.slice("/shorts/".length).split("/")[0] ?? null;
  }

  if (!candidate || !YOUTUBE_VIDEO_ID_PATTERN.test(candidate)) return null;
  return candidate;
}
