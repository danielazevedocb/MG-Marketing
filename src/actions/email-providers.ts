"use server";

import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth-errors";
import { EmailProviderNotFoundError } from "@/lib/email-provider-errors";
import { EmailProviderValidationError } from "@/lib/email-provider-errors";
import {
  emailProviderCreateSchema,
  emailProviderTestSchema,
  emailProviderUpdateSchema,
  type EmailProviderCreateInput,
  type EmailProviderTestInput,
  type EmailProviderUpdateInput,
} from "@/schemas/email-provider";
import { requirePermission } from "@/services/auth";
import {
  getEmailProviderService,
  type ConnectionTestResponse,
  type EmailProviderDto,
} from "@/services/email-providers";

type ActionError = { success: false; error: string; status?: number };
type ActionSuccess<T> = { success: true; data: T };

export type EmailProviderActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: error.message, status: 401 };
  }
  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message, status: 403 };
  }
  if (error instanceof EmailProviderValidationError) {
    return { success: false, error: error.message };
  }
  if (error instanceof EmailProviderNotFoundError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Não foi possível concluir a operação." };
}

export async function listEmailProvidersAction(): Promise<
  EmailProviderActionResult<EmailProviderDto[]>
> {
  try {
    await requirePermission("emailConfig:read");
    const data = await getEmailProviderService().listProviders();
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function getEmailProviderAction(
  id: string,
): Promise<EmailProviderActionResult<EmailProviderDto>> {
  try {
    await requirePermission("emailConfig:read");
    const provider = await getEmailProviderService().getProviderById(id);
    if (!provider) {
      return { success: false, error: "Provedor não encontrado" };
    }
    return { success: true, data: provider };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function createEmailProviderAction(
  input: EmailProviderCreateInput,
): Promise<EmailProviderActionResult<EmailProviderDto>> {
  try {
    const user = await requirePermission("emailConfig:write");
    emailProviderCreateSchema.parse(input);
    const data = await getEmailProviderService().createProvider(input, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updateEmailProviderAction(
  id: string,
  input: EmailProviderUpdateInput,
): Promise<EmailProviderActionResult<EmailProviderDto>> {
  try {
    const user = await requirePermission("emailConfig:write");
    emailProviderUpdateSchema.parse(input);
    const data = await getEmailProviderService().updateProvider(id, input, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteEmailProviderAction(
  id: string,
): Promise<EmailProviderActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("emailConfig:write");
    await getEmailProviderService().deleteProvider(id, user.id);
    return { success: true, data: { id } };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function setActiveEmailProviderAction(
  id: string,
): Promise<EmailProviderActionResult<EmailProviderDto>> {
  try {
    const user = await requirePermission("emailConfig:write");
    const data = await getEmailProviderService().activateProvider(id, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function testEmailProviderConnectionAction(
  input: EmailProviderTestInput,
): Promise<EmailProviderActionResult<ConnectionTestResponse>> {
  try {
    const user = await requirePermission("emailConfig:write");
    emailProviderTestSchema.parse(input);
    const data = await getEmailProviderService().testConnection(input, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}
