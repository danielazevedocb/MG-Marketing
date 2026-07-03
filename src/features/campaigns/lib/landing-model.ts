// Modelo da landing page pública — função pura para testes e renderização.
import type { CampaignType } from "@/generated/prisma/enums";
import { CAMPAIGN_TYPE_LABELS } from "@/schemas/campaign";
import type { CampaignFieldDto } from "@/services/campaigns";
import { sanitizeUrl } from "@/services/channel-content";

export type LandingDetail = {
  label: string;
  value: string;
};

export type LandingViewModel = {
  typeLabel: string;
  titulo: string;
  subtitulo: string | null;
  paragrafos: string[];
  imagemUrl: string | null;
  detalhes: LandingDetail[];
  observacoes: string | null;
};

function formatValidade(iso: string | null): string | null {
  if (!iso?.trim()) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR");
}

export function buildLandingViewModel(
  type: CampaignType,
  field: CampaignFieldDto,
): LandingViewModel {
  const paragrafos = (field.texto ?? "")
    .split(/\n{2,}|\n/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean);

  const detalhes: LandingDetail[] = [];
  if (field.preco?.trim()) {
    detalhes.push({ label: "Preço", value: field.preco.trim() });
  }
  if (field.desconto?.trim()) {
    detalhes.push({ label: "Desconto", value: field.desconto.trim() });
  }
  const validade = formatValidade(field.validade);
  if (validade) {
    detalhes.push({ label: "Válido até", value: validade });
  }

  return {
    typeLabel: CAMPAIGN_TYPE_LABELS[type],
    titulo: field.titulo?.trim() || "Campanha MG Marketing",
    subtitulo: field.subtitulo?.trim() || null,
    paragrafos,
    imagemUrl: sanitizeUrl(field.banner) ?? sanitizeUrl(field.imagem),
    detalhes,
    observacoes: field.observacoes?.trim() || null,
  };
}
