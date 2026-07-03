// Schemas Zod de templates — conteúdo estruturado e validação compartilhada.
import { z } from "zod";

import { TemplateType } from "@/generated/prisma/enums";
import { normalizeOptionalString } from "@/schemas/contact";

const optionalUrl = z
  .string()
  .trim()
  .url("URL inválida")
  .optional()
  .or(z.literal(""));

function optionalShortText(max: number, label: string) {
  return z
    .string()
    .trim()
    .max(max, `${label} muito longo`)
    .optional()
    .or(z.literal(""));
}

/// Conteúdo estruturado do template (serializado como JSON em `conteudo`).
export const templateContentSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo"),
  subtitulo: optionalShortText(300, "Subtítulo"),
  corpo: z
    .string()
    .trim()
    .min(1, "Texto principal é obrigatório")
    .max(5000, "Texto muito longo"),
  ctaTexto: optionalShortText(80, "Texto do botão"),
  ctaUrl: optionalUrl,
  bannerUrl: optionalUrl,
  precoOriginal: optionalShortText(50, "Preço original"),
  precoPromocional: optionalShortText(50, "Preço promocional"),
  validade: optionalShortText(100, "Validade"),
  nomeProduto: optionalShortText(200, "Nome do produto"),
  preco: optionalShortText(50, "Preço"),
  destaque: optionalShortText(200, "Destaque"),
});

export type TemplateContentInput = z.infer<typeof templateContentSchema>;

export const templateTypeSchema = z.nativeEnum(TemplateType);

export const templateFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(120, "Nome muito longo"),
  type: templateTypeSchema,
  category: z
    .string()
    .trim()
    .max(80, "Categoria muito longa")
    .optional()
    .or(z.literal("")),
  favorite: z.boolean(),
  conteudo: templateContentSchema,
});

export type TemplateFormInput = z.infer<typeof templateFormSchema>;

export const templateListFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  type: templateTypeSchema.optional(),
  category: z.string().trim().max(80).optional(),
  favoritesOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type TemplateListFiltersInput = z.infer<
  typeof templateListFiltersSchema
>;

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  [TemplateType.Novidade]: "Novidade",
  [TemplateType.Promocao]: "Promoção",
  [TemplateType.Produto]: "Produto",
  [TemplateType.Captacao]: "Captação",
  [TemplateType.Geral]: "Geral",
};

export { normalizeOptionalString };
