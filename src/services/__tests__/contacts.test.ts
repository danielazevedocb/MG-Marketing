import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactStatus } from "@/generated/prisma/enums";
import { ContactValidationError } from "@/lib/contact-errors";

const createContactMock = vi.fn();
const updateContactMock = vi.fn();
const deleteContactMock = vi.fn();
const findContactByIdMock = vi.fn();
const listContactsMock = vi.fn();
const createContactsBatchMock = vi.fn();
const createAuditLogMock = vi.fn();

vi.mock("@/repositories/contact", () => ({
  createContact: (...args: unknown[]) => createContactMock(...args),
  updateContact: (...args: unknown[]) => updateContactMock(...args),
  deleteContact: (...args: unknown[]) => deleteContactMock(...args),
  findContactById: (...args: unknown[]) => findContactByIdMock(...args),
  listContacts: (...args: unknown[]) => listContactsMock(...args),
  createContactsBatch: (...args: unknown[]) => createContactsBatchMock(...args),
}));

vi.mock("@/repositories/group", () => ({
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  findGroupById: vi.fn(),
  listGroups: vi.fn(),
}));

vi.mock("@/repositories/tag", () => ({
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  findTagById: vi.fn(),
  listTags: vi.fn(),
}));

vi.mock("@/services/audit-log", () => ({
  auditLog: (...args: unknown[]) => createAuditLogMock(...args),
}));

import { ContactService } from "@/services/contacts";

const sampleContact = {
  id: "contact-1",
  nome: "Ana",
  empresa: "MG Indústria",
  telefone: "11999990000",
  email: "ana@mg.com",
  status: ContactStatus.Ativo,
  groups: [],
  tags: [],
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("ContactService", () => {
  let service: ContactService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ContactService();
  });

  it("cria contato válido e registra auditoria", async () => {
    createContactMock.mockResolvedValue(sampleContact);

    const result = await service.createContact(
      {
        empresa: "MG Indústria",
        telefone: "11999990000",
        email: "ana@mg.com",
        status: ContactStatus.Ativo,
        groupIds: [],
        tagIds: [],
      },
      "user-1",
    );

    expect(result.empresa).toBe("MG Indústria");
    expect(createContactMock).toHaveBeenCalledOnce();
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "contact.created", actorId: "user-1" }),
    );
  });

  it("rejeita contato com e-mail inválido", async () => {
    await expect(
      service.createContact(
        {
          empresa: "MG Indústria",
          email: "email-invalido",
          status: ContactStatus.Ativo,
          groupIds: [],
          tagIds: [],
        },
        "user-1",
      ),
    ).rejects.toBeInstanceOf(ContactValidationError);

    expect(createContactMock).not.toHaveBeenCalled();
  });

  it("importa linhas CSV válidas e reporta inválidas", async () => {
    createContactsBatchMock.mockResolvedValue([sampleContact]);

    const result = await service.importCsvContent(
      "empresa,telefone,email,status\nMG Indústria,11999990000,ana@mg.com,Ativo\n,11999990000,email-invalido,Ativo",
      "user-1",
    );

    expect(result.imported).toBe(1);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(createContactsBatchMock).toHaveBeenCalledOnce();
  });

  it("combina busca e filtros na listagem", async () => {
    listContactsMock.mockResolvedValue({ items: [sampleContact], total: 1 });

    const result = await service.listContacts({
      search: "MG",
      status: ContactStatus.Ativo,
      groupId: "clgrp001testgroup1",
      tagId: "cltag001testtag001",
      page: 1,
      pageSize: 20,
    });

    expect(result.total).toBe(1);
    expect(listContactsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "MG",
        status: ContactStatus.Ativo,
        groupId: "clgrp001testgroup1",
        tagId: "cltag001testtag001",
      }),
    );
  });

  it("associa grupo e tag ao atualizar contato", async () => {
    findContactByIdMock.mockResolvedValue(sampleContact);
    updateContactMock.mockResolvedValue({
      ...sampleContact,
      groups: [{ id: "clgrp001testgroup1", nome: "Clientes" }],
      tags: [{ id: "cltag001testtag001", nome: "VIP", cor: null }],
    });

    const result = await service.updateContact(
      "contact-1",
      {
        empresa: "MG Indústria",
        status: ContactStatus.Ativo,
        groupIds: ["clgrp001testgroup1"],
        tagIds: ["cltag001testtag001"],
      },
      "user-1",
    );

    expect(result.groupIds).toEqual(["clgrp001testgroup1"]);
    expect(result.tagIds).toEqual(["cltag001testtag001"]);
    expect(updateContactMock).toHaveBeenCalledWith(
      "contact-1",
      expect.objectContaining({
        groupIds: ["clgrp001testgroup1"],
        tagIds: ["cltag001testtag001"],
      }),
    );
  });
});
