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
  link: null,
  botao: null,
  preco: "R$ 99,90",
  desconto: "10%",
  validade: "2026-08-15T00:00:00.000Z",
  observacoes: "Válido enquanto durar o estoque.",
};

describe("buildLandingViewModel", () => {
  it("monta o modelo completo com parágrafos, detalhes e hero", () => {
    const model = buildLandingViewModel(CampaignType.Novidade, baseField);

    expect(model.typeLabel).toBe("Novidade");
    expect(model.titulo).toBe("Novidade da loja");
    expect(model.subtitulo).toBe("Confira o lançamento");
    expect(model.paragrafos).toEqual([
      "Primeiro parágrafo.",
      "Segundo parágrafo.",
    ]);
    expect(model.heroUrl).toBe("https://cdn.example.com/banner.png");
    expect(model.lateralUrl).toBeNull();
    expect(model.galeria).toEqual([]);
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

  it("banner e imagem juntos viram hero + lateral", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      imagem: "https://cdn.example.com/foto.jpg",
    });

    expect(model.heroUrl).toBe("https://cdn.example.com/banner.png");
    expect(model.lateralUrl).toBe("https://cdn.example.com/foto.jpg");
  });

  it("campanha só com imagem mantém exibição via lateral", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: null,
      imagem: "https://cdn.example.com/foto.jpg",
    });

    expect(model.heroUrl).toBeNull();
    expect(model.lateralUrl).toBe("https://cdn.example.com/foto.jpg");
  });

  it("lateral duplicada do hero é suprimida", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      imagem: baseField.banner,
    });

    expect(model.heroUrl).toBe("https://cdn.example.com/banner.png");
    expect(model.lateralUrl).toBeNull();
  });

  it("galeria sanitiza URLs, remove duplicatas de hero/lateral e corta em 8", () => {
    const validas = Array.from(
      { length: 10 },
      (_, i) => `https://cdn.example.com/g${i}.jpg`,
    );
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      imagem: "https://cdn.example.com/foto.jpg",
      imagens: [
        "javascript:alert(1)",
        baseField.banner!,
        "https://cdn.example.com/foto.jpg",
        ...validas,
        validas[0]!,
      ],
    });

    expect(model.galeria).toEqual(validas.slice(0, 8));
  });

  it("ogImageUrl segue fallback hero → lateral → galeria", () => {
    const semHero = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: null,
      imagem: "https://cdn.example.com/foto.jpg",
    });
    expect(semHero.ogImageUrl).toBe("https://cdn.example.com/foto.jpg");

    const soGaleria = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: null,
      imagem: null,
      imagens: ["https://cdn.example.com/g1.jpg"],
    });
    expect(soGaleria.ogImageUrl).toBe("https://cdn.example.com/g1.jpg");

    const semImagens = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: null,
    });
    expect(semImagens.ogImageUrl).toBeNull();
  });

  it("rejeita URLs de imagem não http/https no hero e lateral", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: "javascript:alert(1)",
      imagem: "data:text/html,<script>alert(1)</script>",
    });

    expect(model.heroUrl).toBeNull();
    expect(model.lateralUrl).toBeNull();
    expect(model.ogImageUrl).toBeNull();
  });

  it("lida com conteúdo mínimo sem quebrar", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      titulo: null,
      subtitulo: null,
      texto: null,
      banner: null,
      imagem: null,
      imagens: [],
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
    expect(model.heroUrl).toBeNull();
    expect(model.lateralUrl).toBeNull();
    expect(model.galeria).toEqual([]);
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
