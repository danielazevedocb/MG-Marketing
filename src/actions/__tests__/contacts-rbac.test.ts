import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactTipo, Role } from "@/generated/prisma/enums";
import { ForbiddenError } from "@/lib/auth-errors";

const authMock = vi.fn();
const contactServiceMock = {
  createContact: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/contacts", () => ({
  getContactService: () => contactServiceMock,
}));

import {
  createContactAction,
  deleteContactAction,
  updateContactAction,
} from "@/actions/contacts";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

describe("RBAC das actions de contatos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Visualizador não pode criar contato (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await createContactAction({
      empresa: "MG Indústria",
      status: "Ativo",
      tipo: ContactTipo.Lead,
      groupIds: [],
      tagIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
      expect(result.error).toBeTruthy();
    }
    expect(contactServiceMock.createContact).not.toHaveBeenCalled();
  });

  it("Visualizador não pode editar contato (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await updateContactAction("contact-1", {
      empresa: "MG Indústria",
      status: "Ativo",
      tipo: ContactTipo.Lead,
      groupIds: [],
      tagIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Visualizador não pode excluir contato (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await deleteContactAction("contact-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Marketing pode criar contato", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));
    contactServiceMock.createContact.mockResolvedValue({
      id: "contact-1",
      empresa: "MG Indústria",
      status: "Ativo",
      tipo: ContactTipo.Lead,
      groupIds: [],
      tagIds: [],
      groups: [],
      tags: [],
      nome: null,
      telefone: null,
      email: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const result = await createContactAction({
      empresa: "MG Indústria",
      status: "Ativo",
      tipo: ContactTipo.Lead,
      groupIds: [],
      tagIds: [],
    });

    expect(result.success).toBe(true);
    expect(contactServiceMock.createContact).toHaveBeenCalledOnce();
  });
});

describe("requirePermission direto", () => {
  it("lança ForbiddenError para Visualizador em contacts:write", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    const { requirePermission } = await import("@/services/auth");
    await expect(requirePermission("contacts:write")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
