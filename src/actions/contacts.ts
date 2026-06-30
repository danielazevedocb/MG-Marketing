"use server";

// Server Actions do módulo de contatos — protegidas por RBAC no servidor.
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth-errors";
import { ContactValidationError } from "@/lib/contact-errors";
import type { ContactStatus } from "@/generated/prisma/enums";
import {
  contactFormSchema,
  contactListFiltersSchema,
  groupFormSchema,
  tagFormSchema,
  type ContactFormInput,
  type ContactListFiltersInput,
  type GroupFormInput,
  type TagFormInput,
} from "@/schemas/contact";
import { CsvImporter } from "@/services/contact-import/csv-importer";
import { ErpMgImporter } from "@/services/contact-import/erp-mg-importer";
import type { ContactImportResult } from "@/services/contact-import/types";
import { requirePermission } from "@/services/auth";
import {
  getContactService,
  type ContactDto,
  type ContactListResponse,
} from "@/services/contacts";

type ActionError = { success: false; error: string; status?: number };
type ActionSuccess<T> = { success: true; data: T };

export type ContactActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: error.message, status: 401 };
  }
  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message, status: 403 };
  }
  if (error instanceof ContactValidationError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Não foi possível concluir a operação." };
}

export async function listContactsAction(
  filters: ContactListFiltersInput,
): Promise<ContactActionResult<ContactListResponse>> {
  try {
    await requirePermission("contacts:read");
    const parsed = contactListFiltersSchema.parse(filters);
    const data = await getContactService().listContacts(parsed);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function getContactAction(
  id: string,
): Promise<ContactActionResult<ContactDto>> {
  try {
    await requirePermission("contacts:read");
    const contact = await getContactService().getContactById(id);
    if (!contact) {
      return { success: false, error: "Contato não encontrado" };
    }
    return { success: true, data: contact };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function createContactAction(
  input: ContactFormInput,
): Promise<ContactActionResult<ContactDto>> {
  try {
    const user = await requirePermission("contacts:write");
    const parsed = contactFormSchema.parse(input);
    const data = await getContactService().createContact(parsed, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updateContactAction(
  id: string,
  input: ContactFormInput,
): Promise<ContactActionResult<ContactDto>> {
  try {
    const user = await requirePermission("contacts:write");
    const parsed = contactFormSchema.parse(input);
    const data = await getContactService().updateContact(id, parsed, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteContactAction(
  id: string,
): Promise<ContactActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("contacts:write");
    await getContactService().deleteContact(id, user.id);
    return { success: true, data: { id } };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function importContactsCsvAction(
  formData: FormData,
): Promise<ContactActionResult<ContactImportResult>> {
  try {
    const user = await requirePermission("contacts:write");
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { success: false, error: "Nenhum arquivo CSV enviado." };
    }

    const content = await file.text();
    const importer = new CsvImporter(getContactService(), content, user.id);
    const data = await importer.import();
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function importContactsErpMgAction(): Promise<
  ContactActionResult<ContactImportResult>
> {
  try {
    await requirePermission("contacts:write");
    const importer = new ErpMgImporter();
    const data = await importer.import();
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function listGroupsAction() {
  try {
    await requirePermission("contacts:read");
    const data = await getContactService().listGroups();
    return { success: true as const, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function createGroupAction(input: GroupFormInput) {
  try {
    const user = await requirePermission("contacts:write");
    const parsed = groupFormSchema.parse(input);
    const data = await getContactService().createGroup(parsed, user.id);
    return { success: true as const, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updateGroupAction(id: string, input: GroupFormInput) {
  try {
    const user = await requirePermission("contacts:write");
    const parsed = groupFormSchema.parse(input);
    const data = await getContactService().updateGroup(id, parsed, user.id);
    return { success: true as const, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteGroupAction(id: string) {
  try {
    const user = await requirePermission("contacts:write");
    await getContactService().deleteGroup(id, user.id);
    return { success: true as const, data: { id } };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function listTagsAction() {
  try {
    await requirePermission("contacts:read");
    const data = await getContactService().listTags();
    return { success: true as const, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function createTagAction(input: TagFormInput) {
  try {
    const user = await requirePermission("contacts:write");
    const parsed = tagFormSchema.parse(input);
    const data = await getContactService().createTag(parsed, user.id);
    return { success: true as const, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updateTagAction(id: string, input: TagFormInput) {
  try {
    const user = await requirePermission("contacts:write");
    const parsed = tagFormSchema.parse(input);
    const data = await getContactService().updateTag(id, parsed, user.id);
    return { success: true as const, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteTagAction(id: string) {
  try {
    const user = await requirePermission("contacts:write");
    await getContactService().deleteTag(id, user.id);
    return { success: true as const, data: { id } };
  } catch (error) {
    return mapActionError(error);
  }
}

export type { ContactDto, ContactListResponse, ContactStatus };
