"use server";

import {
  mapActionError as mapActionErrorBase,
  type ActionError,
  type ActionSuccess,
} from "@/lib/action-error";
import { WhatsAppConfigValidationError } from "@/lib/whatsapp-config-errors";
import type { WhatsAppConfigUpdateInput } from "@/schemas/whatsapp-config";
import { requirePermission } from "@/services/auth";
import {
  getWhatsAppConfigService,
  type WhatsAppConfigDto,
} from "@/services/whatsapp-config";

export type WhatsAppConfigActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  return mapActionErrorBase(error, {
    knownErrors: [WhatsAppConfigValidationError],
  });
}

export async function getWhatsAppConfigAction(): Promise<
  WhatsAppConfigActionResult<WhatsAppConfigDto | null>
> {
  try {
    await requirePermission("whatsappConfig:read");
    const data = await getWhatsAppConfigService().getConfig();
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updateWhatsAppConfigAction(
  input: WhatsAppConfigUpdateInput,
): Promise<WhatsAppConfigActionResult<WhatsAppConfigDto>> {
  try {
    const user = await requirePermission("whatsappConfig:write");
    const data = await getWhatsAppConfigService().updateConfig(input, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}
