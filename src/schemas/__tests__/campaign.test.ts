import { describe, expect, it } from "vitest";

import { CampaignType, Channel } from "@/generated/prisma/enums";
import {
  campaignFieldSchema,
  campaignImageStepSchema,
  campaignWizardStateSchema,
  emptyFieldInput,
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

  it("etapa template aceita ID legado de seed", () => {
    const result = validateWizardStep("template", {
      templateId: "seed-template-promocao-sazonal",
    });
    expect(result.success).toBe(true);
  });

  it("etapa grupos exige contato ou grupo", () => {
    const result = validateWizardStep("grupos", {
      recipientContactIds: [],
      recipientGroupIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Selecione ao menos um contato ou grupo");
    }
  });

  it("etapa grupos aceita grupo sem contatos (rascunho)", () => {
    const result = validateWizardStep("grupos", {
      recipientGroupIds: ["seed_group_001"],
    });
    expect(result.success).toBe(true);
  });

  it("etapa grupos aceita IDs legados de seed", () => {
    const result = validateWizardStep("grupos", {
      recipientGroupIds: ["seed_group_001", "seed_group_002", "seed_group_003"],
      recipientContactIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("etapa grupos tolera recipientContactIds ausente", () => {
    const result = validateWizardStep("grupos", {
      recipientGroupIds: ["seed_group_001"],
    });
    expect(result.success).toBe(true);
  });

  it("etapa grupos rejeita ID vazio", () => {
    const result = validateWizardStep("grupos", {
      recipientGroupIds: [""],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Grupo inválido");
    }
  });

  it("formata erro genérico do Zod em português", () => {
    const result = validateWizardStep("grupos", {
      recipientGroupIds: "invalido",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).not.toBe("Invalid input");
      expect(result.error.length).toBeGreaterThan(10);
    }
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

  it("imagens ausente vira lista vazia (default)", () => {
    const result = campaignFieldSchema.safeParse(validField);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imagens).toEqual([]);
    }
  });

  it("rejeita URL inválida na galeria", () => {
    const result = campaignFieldSchema.safeParse({
      ...validField,
      imagens: ["nao-e-url"],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita galeria com mais de 8 imagens", () => {
    const result = campaignFieldSchema.safeParse({
      ...validField,
      imagens: Array.from(
        { length: 9 },
        (_, i) => `https://cdn.example.com/g${i}.jpg`,
      ),
    });
    expect(result.success).toBe(false);
  });

  it("emptyFieldInput inclui galeria vazia", () => {
    expect(emptyFieldInput().imagens).toEqual([]);
  });
});

describe("campaignImageStepSchema", () => {
  it("aceita banner, imagem e galeria válidos", () => {
    const result = campaignImageStepSchema.safeParse({
      field: {
        banner: "https://cdn.example.com/banner.png",
        imagem: "",
        imagens: ["https://cdn.example.com/g1.jpg"],
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejeita galeria acima do limite na etapa imagem", () => {
    const result = campaignImageStepSchema.safeParse({
      field: {
        banner: "",
        imagem: "",
        imagens: Array.from(
          { length: 9 },
          (_, i) => `https://cdn.example.com/g${i}.jpg`,
        ),
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("campaignWizardStateSchema", () => {
  const draftState = {
    nome: "Campanha teste",
    type: CampaignType.Geral,
    templateId: "",
    field: {
      titulo: "",
      subtitulo: "",
      texto: "",
      banner: "",
      imagem: "",
      link: "",
      botao: "",
      preco: "",
      desconto: "",
      validade: "",
      observacoes: "",
    },
    recipientContactIds: [] as string[],
    recipientGroupIds: [] as string[],
    channels: [] as Channel[],
    wizardStep: "criar" as const,
    scheduledAt: "",
  };

  it("aceita rascunho com conteúdo vazio nas etapas iniciais", () => {
    const result = campaignWizardStateSchema.safeParse(draftState);
    expect(result.success).toBe(true);
  });

  it("aceita templateId legado de seed no estado do wizard", () => {
    const result = campaignWizardStateSchema.safeParse({
      ...draftState,
      templateId: "seed-template-promocao-sazonal",
      wizardStep: "enviar",
    });
    expect(result.success).toBe(true);
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
