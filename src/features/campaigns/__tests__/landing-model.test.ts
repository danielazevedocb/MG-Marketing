import { describe, expect, it } from "vitest";

import { CampaignType } from "@/generated/prisma/enums";
import { buildLandingViewModel } from "@/features/campaigns/lib/landing-model";
import type { CampaignFieldDto } from "@/services/campaigns";

const baseField: CampaignFieldDto = {
  titulo: "Novidade da loja",
  subtitulo: "Confira o lançamento",
  texto: "Primeiro parágrafo.\n\nSegundo parágrafo.",
  banner: "https://cdn.example.com/banner.png",
  imagem: null,
  imagens: [],
  videoUrl: null,
  link: null,
  botao: null,
  preco: "R$ 99,90",
  desconto: "10%",
  validade: "2026-08-15T00:00:00.000Z",
  observacoes: "Válido enquanto durar o estoque.",
};

describe("buildLandingViewModel", () => {
  it("monta o modelo completo com parágrafos, detalhes e fotos", () => {
    const model = buildLandingViewModel(CampaignType.Novidade, baseField);

    expect(model.typeLabel).toBe("Novidade");
    expect(model.titulo).toBe("Novidade da loja");
    expect(model.subtitulo).toBe("Confira o lançamento");
    expect(model.paragrafos).toEqual([
      "Primeiro parágrafo.",
      "Segundo parágrafo.",
    ]);
    expect(model.fotos).toEqual(["https://cdn.example.com/banner.png"]);
    expect(model.detalhes).toEqual([
      { label: "Preço", value: "R$ 99,90" },
      { label: "Desconto", value: "10%" },
      {
        label: "Válido até",
        value: expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}$/),
      },
    ]);
    expect(model.observacoes).toBe("Válido enquanto durar o estoque.");
  });

  it("banner, imagem e galeria viram uma única lista de fotos (nessa ordem)", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      imagem: "https://cdn.example.com/foto.jpg",
      imagens: ["https://cdn.example.com/g1.jpg"],
    });

    expect(model.fotos).toEqual([
      "https://cdn.example.com/banner.png",
      "https://cdn.example.com/foto.jpg",
      "https://cdn.example.com/g1.jpg",
    ]);
  });

  it("remove duplicatas entre banner, imagem e galeria", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      imagem: baseField.banner,
      imagens: [baseField.banner!, "https://cdn.example.com/g1.jpg"],
    });

    expect(model.fotos).toEqual([
      "https://cdn.example.com/banner.png",
      "https://cdn.example.com/g1.jpg",
    ]);
  });

  it("sanitiza URLs inválidas em banner, imagem e galeria", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: "javascript:alert(1)",
      imagem: "data:text/html,<script>alert(1)</script>",
      imagens: ["javascript:alert(2)", "https://cdn.example.com/g1.jpg"],
    });

    expect(model.fotos).toEqual(["https://cdn.example.com/g1.jpg"]);
  });

  it("ogImageUrl é a primeira foto disponível, ou null sem fotos", () => {
    const comFotos = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: null,
      imagem: "https://cdn.example.com/foto.jpg",
    });
    expect(comFotos.ogImageUrl).toBe("https://cdn.example.com/foto.jpg");

    const semFotos = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: null,
    });
    expect(semFotos.ogImageUrl).toBeNull();
  });

  it("videoUrl válido do YouTube vira videoEmbedUrl", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(model.videoEmbedUrl).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("videoUrl ausente ou inválido vira videoEmbedUrl null", () => {
    const semVideo = buildLandingViewModel(CampaignType.Geral, baseField);
    expect(semVideo.videoEmbedUrl).toBeNull();

    const videoInvalido = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      videoUrl: "https://vimeo.com/123456",
    });
    expect(videoInvalido.videoEmbedUrl).toBeNull();
  });

  it("lida com conteúdo mínimo sem quebrar", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      titulo: null,
      subtitulo: null,
      texto: null,
      banner: null,
      imagem: null,
      imagens: [],
      videoUrl: null,
      link: null,
      botao: null,
      preco: null,
      desconto: null,
      validade: null,
      observacoes: null,
    });

    expect(model.titulo).toBe("Campanha MG Marketing");
    expect(model.subtitulo).toBeNull();
    expect(model.paragrafos).toEqual([]);
    expect(model.detalhes).toEqual([]);
    expect(model.fotos).toEqual([]);
    expect(model.ogImageUrl).toBeNull();
    expect(model.videoEmbedUrl).toBeNull();
  });

  it("ignora validade inválida sem lançar erro", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      validade: "data-invalida",
    });

    expect(
      model.detalhes.find((detalhe) => detalhe.label === "Válido até"),
    ).toBeUndefined();
  });
});
