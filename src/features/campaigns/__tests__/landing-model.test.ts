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
  link: null,
  botao: null,
  preco: "R$ 99,90",
  desconto: "10%",
  validade: "2026-08-15T00:00:00.000Z",
  observacoes: "Válido enquanto durar o estoque.",
};

describe("buildLandingViewModel", () => {
  it("monta o modelo completo com parágrafos, detalhes e imagem", () => {
    const model = buildLandingViewModel(CampaignType.Novidade, baseField);

    expect(model.typeLabel).toBe("Novidade");
    expect(model.titulo).toBe("Novidade da loja");
    expect(model.subtitulo).toBe("Confira o lançamento");
    expect(model.paragrafos).toEqual([
      "Primeiro parágrafo.",
      "Segundo parágrafo.",
    ]);
    expect(model.imagemUrl).toBe("https://cdn.example.com/banner.png");
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

  it("usa imagem como fallback quando banner está ausente", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: null,
      imagem: "https://cdn.example.com/foto.jpg",
    });

    expect(model.imagemUrl).toBe("https://cdn.example.com/foto.jpg");
  });

  it("rejeita URLs de imagem não http/https", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      ...baseField,
      banner: "javascript:alert(1)",
      imagem: "data:text/html,<script>alert(1)</script>",
    });

    expect(model.imagemUrl).toBeNull();
  });

  it("lida com conteúdo mínimo sem quebrar", () => {
    const model = buildLandingViewModel(CampaignType.Geral, {
      titulo: null,
      subtitulo: null,
      texto: null,
      banner: null,
      imagem: null,
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
    expect(model.imagemUrl).toBeNull();
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
