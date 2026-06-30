import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role, TemplateType } from "@/generated/prisma/enums";
import { ForbiddenError } from "@/lib/auth-errors";

const authMock = vi.fn();
const templateServiceMock = {
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/templates", () => ({
  getTemplateService: () => templateServiceMock,
}));

import {
  createTemplateAction,
  deleteTemplateAction,
  updateTemplateAction,
} from "@/actions/templates";

const sampleContent = {
  titulo: "Título",
  subtitulo: "",
  corpo: "Corpo",
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

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

describe("RBAC das actions de templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Visualizador não pode criar template (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await createTemplateAction({
      nome: "Template teste",
      type: TemplateType.Geral,
      category: "",
      favorite: false,
      conteudo: sampleContent,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(templateServiceMock.createTemplate).not.toHaveBeenCalled();
  });

  it("Visualizador não pode editar template (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await updateTemplateAction("template-1", {
      nome: "Template teste",
      type: TemplateType.Geral,
      category: "",
      favorite: false,
      conteudo: sampleContent,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Visualizador não pode excluir template (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await deleteTemplateAction("template-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Marketing pode criar template", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));
    templateServiceMock.createTemplate.mockResolvedValue({
      id: "template-1",
      nome: "Template teste",
      type: TemplateType.Geral,
      category: null,
      favorite: false,
      conteudo: sampleContent,
      authorId: "user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const result = await createTemplateAction({
      nome: "Template teste",
      type: TemplateType.Geral,
      category: "",
      favorite: false,
      conteudo: sampleContent,
    });

    expect(result.success).toBe(true);
    expect(templateServiceMock.createTemplate).toHaveBeenCalledOnce();
  });
});

describe("requirePermission direto (templates)", () => {
  it("lança ForbiddenError para Visualizador em templates:write", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    const { requirePermission } = await import("@/services/auth");
    await expect(requirePermission("templates:write")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
