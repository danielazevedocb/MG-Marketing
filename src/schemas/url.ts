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
