// Modelo de preview do template — função pura para testes e renderização.
import { TemplateType } from "@/generated/prisma/enums";
import type { TemplateContentInput } from "@/schemas/template";
import { TEMPLATE_TYPE_LABELS } from "@/schemas/template";

export type TemplatePreviewSection = {
  label: string;
  value: string;
};

export type TemplatePreviewModel = {
  typeLabel: string;
  titulo: string;
  subtitulo: string | null;
  corpo: string;
  ctaTexto: string | null;
  ctaUrl: string | null;
  bannerUrl: string | null;
  sections: TemplatePreviewSection[];
};

export function buildTemplatePreviewModel(
  type: TemplateType,
  content: TemplateContentInput,
): TemplatePreviewModel {
  const sections: TemplatePreviewSection[] = [];

  if (type === TemplateType.Promocao) {
    if (content.precoOriginal) {
      sections.push({ label: "Preço original", value: content.precoOriginal });
    }
    if (content.precoPromocional) {
      sections.push({
        label: "Preço promocional",
        value: content.precoPromocional,
      });
    }
    if (content.validade) {
      sections.push({ label: "Validade", value: content.validade });
    }
  }

  if (type === TemplateType.Produto) {
    if (content.nomeProduto) {
      sections.push({ label: "Produto", value: content.nomeProduto });
    }
    if (content.preco) {
      sections.push({ label: "Preço", value: content.preco });
    }
  }

  if (type === TemplateType.Novidade && content.destaque) {
    sections.push({ label: "Destaque", value: content.destaque });
  }

  return {
    typeLabel: TEMPLATE_TYPE_LABELS[type],
    titulo: content.titulo,
    subtitulo: content.subtitulo?.trim() || null,
    corpo: content.corpo,
    ctaTexto: content.ctaTexto?.trim() || null,
    ctaUrl: content.ctaUrl?.trim() || null,
    bannerUrl: content.bannerUrl?.trim() || null,
    sections,
  };
}
