// Serviço de contatos — regras de negócio, validação Zod e auditoria.
import { ZodError } from "zod";

import { ContactStatus } from "@/generated/prisma/enums";
import { ContactValidationError } from "@/lib/contact-errors";
import { auditLog } from "@/services/audit-log";
import {
  createContact,
  createContactsBatch,
  deleteContact,
  findContactById,
  listContacts,
  updateContact,
  type ContactListQuery,
  type ContactListResult,
  type ContactWithRelations,
  type CreateContactData,
} from "@/repositories/contact";
import {
  createGroup,
  deleteGroup,
  findGroupById,
  listGroups,
  updateGroup,
  type GroupWithCount,
} from "@/repositories/group";
import {
  createTag,
  deleteTag,
  findTagById,
  listTags,
  updateTag,
  type TagWithCount,
} from "@/repositories/tag";
import {
  contactFormSchema,
  contactListFiltersSchema,
  csvContactRowSchema,
  groupFormSchema,
  normalizeOptionalString,
  tagFormSchema,
  type ContactFormInput,
  type ContactListFiltersInput,
  type CsvContactRow,
  type GroupFormInput,
  type TagFormInput,
} from "@/schemas/contact";
import type { ContactImportResult } from "@/services/contact-import/types";
import { parseCsvContent } from "@/utils/csv-parser";

export type ContactDto = {
  id: string;
  nome: string | null;
  empresa: string;
  telefone: string | null;
  email: string | null;
  status: ContactStatus;
  groupIds: string[];
  tagIds: string[];
  groups: { id: string; nome: string }[];
  tags: { id: string; nome: string; cor: string | null }[];
  createdAt: string;
  updatedAt: string;
};

export type ContactListResponse = {
  items: ContactDto[];
  total: number;
  page: number;
  pageSize: number;
};

function toContactDto(contact: ContactWithRelations): ContactDto {
  return {
    id: contact.id,
    nome: contact.nome,
    empresa: contact.empresa,
    telefone: contact.telefone,
    email: contact.email,
    status: contact.status,
    groupIds: contact.groups.map((group) => group.id),
    tagIds: contact.tags.map((tag) => tag.id),
    groups: contact.groups.map((group) => ({
      id: group.id,
      nome: group.nome,
    })),
    tags: contact.tags.map((tag) => ({
      id: tag.id,
      nome: tag.nome,
      cor: tag.cor,
    })),
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

function toCreateData(input: ContactFormInput): CreateContactData {
  return {
    nome: normalizeOptionalString(input.nome),
    empresa: input.empresa.trim(),
    telefone: normalizeOptionalString(input.telefone),
    email: normalizeOptionalString(input.email),
    status: input.status,
    groupIds: input.groupIds,
    tagIds: input.tagIds,
  };
}

function formatZodError(error: ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}

export class ContactService {
  async createContact(
    input: ContactFormInput,
    actorId: string,
  ): Promise<ContactDto> {
    const parsed = this.parseContactInput(input);
    const contact = await createContact(toCreateData(parsed));

    await auditLog({
      actorId,
      action: "contact.created",
      entity: "Contact",
      entityId: contact.id,
      payload: { empresa: contact.empresa },
    });

    return toContactDto(contact);
  }

  async updateContact(
    id: string,
    input: ContactFormInput,
    actorId: string,
  ): Promise<ContactDto> {
    const existing = await findContactById(id);
    if (!existing) {
      throw new ContactValidationError("Contato não encontrado");
    }

    const parsed = this.parseContactInput(input);
    const contact = await updateContact(id, toCreateData(parsed));

    await auditLog({
      actorId,
      action: "contact.updated",
      entity: "Contact",
      entityId: contact.id,
      payload: { empresa: contact.empresa },
    });

    return toContactDto(contact);
  }

  async deleteContact(id: string, actorId: string): Promise<void> {
    const existing = await findContactById(id);
    if (!existing) {
      throw new ContactValidationError("Contato não encontrado");
    }

    await deleteContact(id);

    await auditLog({
      actorId,
      action: "contact.deleted",
      entity: "Contact",
      entityId: id,
      payload: { empresa: existing.empresa },
    });
  }

  async getContactById(id: string): Promise<ContactDto | null> {
    const contact = await findContactById(id);
    return contact ? toContactDto(contact) : null;
  }

  async listContacts(
    filters: ContactListFiltersInput,
  ): Promise<ContactListResponse> {
    const parsed = contactListFiltersSchema.parse(filters);
    const skip = (parsed.page - 1) * parsed.pageSize;

    const query: ContactListQuery = {
      search: parsed.search,
      status: parsed.status,
      groupId: parsed.groupId,
      tagId: parsed.tagId,
      skip,
      take: parsed.pageSize,
    };

    const result: ContactListResult = await listContacts(query);

    return {
      items: result.items.map(toContactDto),
      total: result.total,
      page: parsed.page,
      pageSize: parsed.pageSize,
    };
  }

  async importCsvContent(
    content: string,
    actorId: string,
  ): Promise<ContactImportResult> {
    const parsed = parseCsvContent(content);
    const rows: CsvContactRow[] = [];
    const lineNumbers: number[] = [];
    const errors: ContactImportResult["errors"] = [];

    parsed.rows.forEach((row, index) => {
      const line = index + 2;
      const result = csvContactRowSchema.safeParse({
        empresa: row.empresa ?? "",
        telefone: row.telefone ?? "",
        email: row.email ?? "",
        status: row.status || undefined,
        nome: row.nome ?? "",
      });

      if (!result.success) {
        errors.push({ line, message: formatZodError(result.error) });
        return;
      }

      rows.push(result.data);
      lineNumbers.push(line);
    });

    const importResult = await this.importCsvRows(rows, lineNumbers, actorId);

    return {
      imported: importResult.imported,
      skipped: errors.length + importResult.errors.length,
      errors: [...errors, ...importResult.errors],
    };
  }

  async importCsvRows(
    rows: CsvContactRow[],
    lineNumbers: number[],
    actorId: string,
  ): Promise<ContactImportResult> {
    const validContacts: CreateContactData[] = [];
    const errors: ContactImportResult["errors"] = [];

    rows.forEach((row, index) => {
      const parsed = csvContactRowSchema.safeParse(row);
      const line = lineNumbers[index] ?? index + 2;

      if (!parsed.success) {
        errors.push({ line, message: formatZodError(parsed.error) });
        return;
      }

      validContacts.push({
        nome: normalizeOptionalString(parsed.data.nome),
        empresa: parsed.data.empresa.trim(),
        telefone: normalizeOptionalString(parsed.data.telefone),
        email: normalizeOptionalString(parsed.data.email),
        status: parsed.data.status,
      });
    });

    if (validContacts.length > 0) {
      const created = await createContactsBatch(validContacts);
      await auditLog({
        actorId,
        action: "contact.imported",
        entity: "Contact",
        payload: { count: created.length, source: "csv" },
      });
    }

    return {
      imported: validContacts.length,
      skipped: errors.length,
      errors,
    };
  }

  async createGroup(input: GroupFormInput, actorId: string) {
    const parsed = groupFormSchema.parse(input);
    const group = await createGroup({
      nome: parsed.nome.trim(),
      descricao: normalizeOptionalString(parsed.descricao),
    });

    await auditLog({
      actorId,
      action: "group.created",
      entity: "Group",
      entityId: group.id,
      payload: { nome: group.nome },
    });

    return group;
  }

  async updateGroup(id: string, input: GroupFormInput, actorId: string) {
    const existing = await findGroupById(id);
    if (!existing) {
      throw new ContactValidationError("Grupo não encontrado");
    }

    const parsed = groupFormSchema.parse(input);
    const group = await updateGroup(id, {
      nome: parsed.nome.trim(),
      descricao: normalizeOptionalString(parsed.descricao),
    });

    await auditLog({
      actorId,
      action: "group.updated",
      entity: "Group",
      entityId: group.id,
    });

    return group;
  }

  async deleteGroup(id: string, actorId: string) {
    const existing = await findGroupById(id);
    if (!existing) {
      throw new ContactValidationError("Grupo não encontrado");
    }

    await deleteGroup(id);

    await auditLog({
      actorId,
      action: "group.deleted",
      entity: "Group",
      entityId: id,
    });
  }

  async listGroups(): Promise<GroupWithCount[]> {
    return listGroups();
  }

  async createTag(input: TagFormInput, actorId: string) {
    const parsed = tagFormSchema.parse(input);
    const tag = await createTag({
      nome: parsed.nome.trim(),
      cor: normalizeOptionalString(parsed.cor),
    });

    await auditLog({
      actorId,
      action: "tag.created",
      entity: "Tag",
      entityId: tag.id,
      payload: { nome: tag.nome },
    });

    return tag;
  }

  async updateTag(id: string, input: TagFormInput, actorId: string) {
    const existing = await findTagById(id);
    if (!existing) {
      throw new ContactValidationError("Tag não encontrada");
    }

    const parsed = tagFormSchema.parse(input);
    const tag = await updateTag(id, {
      nome: parsed.nome.trim(),
      cor: normalizeOptionalString(parsed.cor),
    });

    await auditLog({
      actorId,
      action: "tag.updated",
      entity: "Tag",
      entityId: tag.id,
    });

    return tag;
  }

  async deleteTag(id: string, actorId: string) {
    const existing = await findTagById(id);
    if (!existing) {
      throw new ContactValidationError("Tag não encontrada");
    }

    await deleteTag(id);

    await auditLog({
      actorId,
      action: "tag.deleted",
      entity: "Tag",
      entityId: id,
    });
  }

  async listTags(): Promise<TagWithCount[]> {
    return listTags();
  }

  private parseContactInput(input: ContactFormInput): ContactFormInput {
    const result = contactFormSchema.safeParse(input);
    if (!result.success) {
      throw new ContactValidationError(formatZodError(result.error));
    }
    return result.data;
  }
}

let defaultContactService: ContactService | null = null;

export function getContactService(): ContactService {
  if (!defaultContactService) {
    defaultContactService = new ContactService();
  }
  return defaultContactService;
}

export function setContactServiceForTests(service: ContactService | null): void {
  defaultContactService = service;
}

export { toContactDto };
