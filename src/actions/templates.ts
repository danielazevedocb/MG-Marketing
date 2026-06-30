"use server";

// Server Actions do módulo de templates — protegidas por RBAC no servidor.
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth-errors";
import { TemplateValidationError } from "@/lib/template-errors";
import {
  templateFormSchema,
  templateListFiltersSchema,
  type TemplateFormInput,
  type TemplateListFiltersInput,
} from "@/schemas/template";
import { requirePermission } from "@/services/auth";
import {
  getTemplateService,
  type TemplateDto,
  type TemplateListResponse,
} from "@/services/templates";

type ActionError = { success: false; error: string; status?: number };
type ActionSuccess<T> = { success: true; data: T };

export type TemplateActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: error.message, status: 401 };
  }
  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message, status: 403 };
  }
  if (error instanceof TemplateValidationError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Não foi possível concluir a operação." };
}

export async function listTemplatesAction(
  filters: TemplateListFiltersInput,
): Promise<TemplateActionResult<TemplateListResponse>> {
  try {
    await requirePermission("templates:read");
    const parsed = templateListFiltersSchema.parse(filters);
    const data = await getTemplateService().listTemplates(parsed);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function getTemplateAction(
  id: string,
): Promise<TemplateActionResult<TemplateDto>> {
  try {
    await requirePermission("templates:read");
    const template = await getTemplateService().getTemplateById(id);
    if (!template) {
      return { success: false, error: "Template não encontrado" };
    }
    return { success: true, data: template };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function createTemplateAction(
  input: TemplateFormInput,
): Promise<TemplateActionResult<TemplateDto>> {
  try {
    const user = await requirePermission("templates:write");
    const parsed = templateFormSchema.parse(input);
    const data = await getTemplateService().createTemplate(parsed, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updateTemplateAction(
  id: string,
  input: TemplateFormInput,
): Promise<TemplateActionResult<TemplateDto>> {
  try {
    const user = await requirePermission("templates:write");
    const parsed = templateFormSchema.parse(input);
    const data = await getTemplateService().updateTemplate(id, parsed, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteTemplateAction(
  id: string,
): Promise<TemplateActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("templates:write");
    await getTemplateService().deleteTemplate(id, user.id);
    return { success: true, data: { id } };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function toggleTemplateFavoriteAction(
  id: string,
): Promise<TemplateActionResult<TemplateDto>> {
  try {
    const user = await requirePermission("templates:write");
    const data = await getTemplateService().toggleFavorite(id, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function duplicateTemplateAction(
  id: string,
): Promise<TemplateActionResult<TemplateDto>> {
  try {
    const user = await requirePermission("templates:write");
    const data = await getTemplateService().duplicateTemplate(id, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function listTemplateCategoriesAction(): Promise<
  TemplateActionResult<string[]>
> {
  try {
    await requirePermission("templates:read");
    const data = await getTemplateService().listCategories();
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export type { TemplateDto, TemplateListResponse };
