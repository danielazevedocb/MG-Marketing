import { describe, expect, it, vi, beforeEach } from "vitest";

import { TemplateType } from "@/generated/prisma/enums";
import { TemplateValidationError } from "@/lib/template-errors";

const createTemplateMock = vi.fn();
const updateTemplateMock = vi.fn();
const deleteTemplateMock = vi.fn();
const findTemplateByIdMock = vi.fn();
const listTemplatesMock = vi.fn();
const listTemplateCategoriesMock = vi.fn();
const createAuditLogMock = vi.fn();

vi.mock("@/repositories/template", () => ({
  createTemplate: (...args: unknown[]) => createTemplateMock(...args),
  updateTemplate: (...args: unknown[]) => updateTemplateMock(...args),
  deleteTemplate: (...args: unknown[]) => deleteTemplateMock(...args),
  findTemplateById: (...args: unknown[]) => findTemplateByIdMock(...args),
  listTemplates: (...args: unknown[]) => listTemplatesMock(...args),
  listTemplateCategories: (...args: unknown[]) =>
    listTemplateCategoriesMock(...args),
}));

vi.mock("@/services/audit-log", () => ({
  auditLog: (...args: unknown[]) => createAuditLogMock(...args),
}));

import { TemplateService } from "@/services/templates";

const sampleContent = {
  titulo: "Oferta especial",
  subtitulo: "",
  corpo: "Aproveite condições exclusivas.",
  ctaTexto: "",
  ctaUrl: "",
  bannerUrl: "",
  precoOriginal: "",
  precoPromocional: "",
  validade: "",
  nomeProduto: "",
  preco: "",
  destaque: "",
};

const sampleTemplate = {
  id: "template-1",
  nome: "Promoção verão",
  type: TemplateType.Promocao,
  category: "Sazonal",
  conteudo: JSON.stringify(sampleContent),
  favorite: false,
  authorId: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const validInput = {
  nome: "Promoção verão",
  type: TemplateType.Promocao,
  category: "Sazonal",
  favorite: false,
  conteudo: sampleContent,
};

describe("TemplateService", () => {
  let service: TemplateService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TemplateService();
  });

  it("cria template com tipo válido e registra auditoria", async () => {
    createTemplateMock.mockResolvedValue(sampleTemplate);

    const result = await service.createTemplate(validInput, "user-1");

    expect(result.nome).toBe("Promoção verão");
    expect(result.type).toBe(TemplateType.Promocao);
    expect(createTemplateMock).toHaveBeenCalledOnce();
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "template.created", actorId: "user-1" }),
    );
  });

  it("rejeita tipo inválido", async () => {
    await expect(
      service.createTemplate(
        {
          ...validInput,
          type: "Invalido" as TemplateType,
        },
        "user-1",
      ),
    ).rejects.toBeInstanceOf(TemplateValidationError);

    expect(createTemplateMock).not.toHaveBeenCalled();
  });

  it("duplica template sem alterar o original", async () => {
    const duplicate = {
      ...sampleTemplate,
      id: "template-2",
      nome: "Cópia de Promoção verão",
      favorite: false,
    };

    findTemplateByIdMock.mockResolvedValue(sampleTemplate);
    createTemplateMock.mockResolvedValue(duplicate);

    const result = await service.duplicateTemplate("template-1", "user-1");

    expect(result.id).toBe("template-2");
    expect(result.nome).toBe("Cópia de Promoção verão");
    expect(createTemplateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Cópia de Promoção verão",
        conteudo: sampleTemplate.conteudo,
        favorite: false,
      }),
    );
    expect(updateTemplateMock).not.toHaveBeenCalled();
  });

  it("favoritar persiste o estado", async () => {
    findTemplateByIdMock.mockResolvedValue(sampleTemplate);
    updateTemplateMock.mockResolvedValue({ ...sampleTemplate, favorite: true });

    const result = await service.toggleFavorite("template-1", "user-1");

    expect(result.favorite).toBe(true);
    expect(updateTemplateMock).toHaveBeenCalledWith("template-1", {
      favorite: true,
    });
  });

  it("combina busca e filtro por tipo na listagem", async () => {
    listTemplatesMock.mockResolvedValue({ items: [sampleTemplate], total: 1 });

    const result = await service.listTemplates({
      search: "verão",
      type: TemplateType.Promocao,
      page: 1,
      pageSize: 20,
    });

    expect(result.total).toBe(1);
    expect(listTemplatesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "verão",
        type: TemplateType.Promocao,
      }),
    );
  });
});
