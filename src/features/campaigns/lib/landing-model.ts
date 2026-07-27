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
  /// Banner exibido em destaque logo após o texto — só quando não há
  /// vídeo (vídeo e banner ocupam o mesmo lugar, vídeo tem prioridade).
  /// Não entra na grade de fotos.
  bannerUrl: string | null;
  /// Logo (campo `imagem`) exibida sozinha numa barra de cabeçalho no topo
  /// da página — não entra na grade de fotos (evita duplicar).
  logoUrl: string | null;
  /// Galeria de fotos extras (campo `imagens`), sanitizada, sem duplicatas
  /// e sem repetir banner/logo, exibida em grade após vídeo/banner.
  fotos: string[];
  /// Imagem usada no card de preview (og:image): banner → 1ª foto → logo.
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
  const bannerUrl = sanitizeUrl(field.banner);
  const logoUrl = sanitizeUrl(field.imagem);

  const fotos = (field.imagens ?? [])
    .map((url) => sanitizeUrl(url))
    .filter((url): url is string => Boolean(url))
    .filter((url) => url !== bannerUrl && url !== logoUrl)
    .filter((url, index, list) => list.indexOf(url) === index);

  return {
    typeLabel: CAMPAIGN_TYPE_LABELS[type],
    titulo: field.titulo?.trim() || "Campanha MG Marketing",
    subtitulo: field.subtitulo?.trim() || null,
    paragrafos,
    videoEmbedUrl,
    bannerUrl,
    logoUrl,
    fotos,
    ogImageUrl: bannerUrl ?? fotos[0] ?? logoUrl ?? null,
    detalhes,
    observacoes: field.observacoes?.trim() || null,
  };
}
