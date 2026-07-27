// Modelo da landing page pública — função pura para testes e renderização.
import type { CampaignType } from "@/generated/prisma/enums";
import { CAMPAIGN_TYPE_LABELS } from "@/schemas/campaign";
import type { CampaignFieldDto } from "@/services/campaigns";
import { sanitizeUrl, sanitizeYouTubeUrl } from "@/services/channel-content";

export type LandingDetail = {
  label: string;
  value: string;
};

export type LandingViewModel = {
  typeLabel: string;
  titulo: string;
  subtitulo: string | null;
  paragrafos: string[];
  /// Embed seguro (youtube-nocookie.com/embed/{id}) do vídeo do YouTube,
  /// exclusivo da landing pública — nunca aparece em Email/WhatsApp.
  videoEmbedUrl: string | null;
  /// Fotos da campanha (banner + imagem + galeria unificados), sanitizadas,
  /// sem duplicatas, exibidas em grade abaixo do texto/vídeo — layout
  /// "blog": explicação primeiro, mídia depois.
  fotos: string[];
  /// Imagem usada no card de preview (og:image): 1ª foto disponível.
  ogImageUrl: string | null;
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

  const videoEmbedUrl = sanitizeYouTubeUrl(field.videoUrl);

  const fotos = [field.banner, field.imagem, ...(field.imagens ?? [])]
    .map((url) => sanitizeUrl(url))
    .filter((url): url is string => Boolean(url))
    .filter((url, index, list) => list.indexOf(url) === index);

  return {
    typeLabel: CAMPAIGN_TYPE_LABELS[type],
    titulo: field.titulo?.trim() || "Campanha MG Marketing",
    subtitulo: field.subtitulo?.trim() || null,
    paragrafos,
    videoEmbedUrl,
    fotos,
    ogImageUrl: fotos[0] ?? null,
    detalhes,
    observacoes: field.observacoes?.trim() || null,
  };
}
