import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignType } from "@/generated/prisma/enums";
import type { CampaignFieldDto } from "@/services/campaigns";

const getPublicCampaignBySlugMock = vi.fn();

vi.mock("@/services/campaigns", () => ({
  getCampaignService: () => ({
    getPublicCampaignBySlug: (...args: unknown[]) =>
      getPublicCampaignBySlugMock(...args),
  }),
}));

import PublicCampaignPage, { generateMetadata } from "@/app/c/[slug]/page";

const validSlug = "a".repeat(32);

const sampleField: CampaignFieldDto = {
  titulo: "Promoção de verão",
  subtitulo: "Só até domingo",
  texto: "Aproveite os melhores preços da temporada.",
  banner: "https://cdn.example.com/banner.jpg",
  imagem: null,
  imagens: [],
  link: null,
  botao: null,
  preco: "199,90",
  desconto: "20%",
  validade: null,
  observacoes: null,
};

describe("PublicCampaignPage (/c/[slug])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama notFound quando o slug não corresponde a nenhuma campanha enviada", async () => {
    getPublicCampaignBySlugMock.mockResolvedValue(null);

    await expect(
      PublicCampaignPage({ params: Promise.resolve({ slug: validSlug }) }),
    ).rejects.toThrow();

    expect(getPublicCampaignBySlugMock).toHaveBeenCalledWith(validSlug);
  });

  it("renderiza o conteúdo da campanha quando o slug é válido", async () => {
    getPublicCampaignBySlugMock.mockResolvedValue({
      type: CampaignType.Promocao,
      sentAt: "2026-01-10T12:00:00.000Z",
      field: sampleField,
    });

    const element = await PublicCampaignPage({
      params: Promise.resolve({ slug: validSlug }),
    });
    render(element);

    expect(
      screen.getByRole("heading", { name: "Promoção de verão" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Só até domingo")).toBeInTheDocument();
  });
});

describe("generateMetadata (/c/[slug])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna metadata genérica com noindex quando a campanha não existe", async () => {
    getPublicCampaignBySlugMock.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: validSlug }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toBe("Campanha — MG Marketing");
  });

  it("monta título/descrição/OG a partir do conteúdo da campanha", async () => {
    getPublicCampaignBySlugMock.mockResolvedValue({
      type: CampaignType.Promocao,
      sentAt: "2026-01-10T12:00:00.000Z",
      field: sampleField,
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: validSlug }),
    });

    expect(metadata.title).toBe("Promoção de verão");
    expect(metadata.description).toBe("Só até domingo");
    // Landing pública nunca deve ser indexada pelo Google.
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
