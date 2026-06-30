import { describe, expect, it } from "vitest";

import { CampaignType, Channel } from "@/generated/prisma/enums";
import {
  campaignFieldSchema,
  getNextWizardStep,
  getPreviousWizardStep,
  validateWizardStep,
} from "@/schemas/campaign";

describe("validateWizardStep", () => {
  it("avanço válido na etapa criar preserva nome", () => {
    const result = validateWizardStep("criar", { nome: "Campanha teste" });
    expect(result.success).toBe(true);
  });

  it("etapa inválida bloqueia avanço", () => {
    const result = validateWizardStep("criar", { nome: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("obrigatório");
    }
  });

  it("etapa template exige templateId", () => {
    const result = validateWizardStep("template", { templateId: "" });
    expect(result.success).toBe(false);
  });

  it("etapa grupos exige contato ou grupo", () => {
    const result = validateWizardStep("grupos", {
      recipientContactIds: [],
      recipientGroupIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("transições de etapa seguem ordem do wizard", () => {
    expect(getNextWizardStep("criar")).toBe("tipo");
    expect(getPreviousWizardStep("tipo")).toBe("criar");
  });
});

describe("campaignFieldSchema", () => {
  const validField = {
    titulo: "Título",
    subtitulo: "",
    texto: "Corpo da mensagem",
    banner: "",
    imagem: "",
    link: "",
    botao: "",
    preco: "99,90",
    desconto: "10",
    validade: "2026-12-31",
    observacoes: "",
  };

  it("campos válidos passam na validação", () => {
    const result = campaignFieldSchema.safeParse(validField);
    expect(result.success).toBe(true);
  });

  it("rejeita preço inválido", () => {
    const result = campaignFieldSchema.safeParse({
      ...validField,
      preco: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita desconto inválido", () => {
    const result = campaignFieldSchema.safeParse({
      ...validField,
      desconto: "xyz",
    });
    expect(result.success).toBe(false);
  });
});

describe("validateWizardStep canal", () => {
  it("aceita WhatsApp e Email (ambos)", () => {
    const result = validateWizardStep("canal", {
      channels: [Channel.WhatsApp, Channel.Email],
    });
    expect(result.success).toBe(true);
  });

  it("bloqueia canal vazio", () => {
    const result = validateWizardStep("canal", { channels: [] });
    expect(result.success).toBe(false);
  });
});

describe("validateWizardStep tipo", () => {
  it("aceita CampaignType válido", () => {
    const result = validateWizardStep("tipo", { type: CampaignType.Promocao });
    expect(result.success).toBe(true);
  });
});
