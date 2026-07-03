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
  /// Banner em largura total no topo da página.
  heroUrl: string | null;
  /// Imagem exibida na coluna ao lado do texto (null se igual ao hero).
  lateralUrl: string | null;
  /// Galeria em grade abaixo do conteúdo (sanitizada, sem duplicar hero/lateral).
  galeria: string[];
  /// Imagem usada no card de preview (og:image): hero → lateral → 1ª da galeria.
  ogImageUrl: string | null;
  detalhes: LandingDetail[];
  observacoes: string | null;
};

const MAX_GALLERY_IMAGES = 8;

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

  const heroUrl = sanitizeUrl(field.banner);
  const imagemSanitizada = sanitizeUrl(field.imagem);
  const lateralUrl = imagemSanitizada === heroUrl ? null : imagemSanitizada;

  const galeria = (field.imagens ?? [])
    .map((url) => sanitizeUrl(url))
    .filter((url): url is string => Boolean(url))
    .filter((url) => url !== heroUrl && url !== lateralUrl)
    .filter((url, index, list) => list.indexOf(url) === index)
    .slice(0, MAX_GALLERY_IMAGES);

  return {
    typeLabel: CAMPAIGN_TYPE_LABELS[type],
    titulo: field.titulo?.trim() || "Campanha MG Marketing",
    subtitulo: field.subtitulo?.trim() || null,
    paragrafos,
    heroUrl,
    lateralUrl,
    galeria,
    ogImageUrl: heroUrl ?? lateralUrl ?? galeria[0] ?? null,
    detalhes,
    observacoes: field.observacoes?.trim() || null,
  };
}
