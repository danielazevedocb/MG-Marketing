"use server";

import {
  EmailProviderNotFoundError,
  EmailProviderValidationError,
} from "@/lib/email-provider-errors";
import {
  mapActionError as mapActionErrorBase,
  type ActionError,
  type ActionSuccess,
} from "@/lib/action-error";
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

export type EmailProviderActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  return mapActionErrorBase(error, {
    knownErrors: [EmailProviderValidationError, EmailProviderNotFoundError],
  });
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
    const data = await getEmailProviderService().updateProvider(
      id,
      input,
      user.id,
    );
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
