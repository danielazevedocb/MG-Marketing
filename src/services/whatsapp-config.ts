// Regras de negócio da configuração de WhatsApp (nome/telefone de exibição e
// assinatura anexada às mensagens — sem credenciais de API).
import { WhatsAppConfigValidationError } from "@/lib/whatsapp-config-errors";
import {
  getWhatsAppConfig,
  upsertWhatsAppConfig,
} from "@/repositories/whatsapp-config";
import { auditLog } from "@/services/audit-log";
import {
  whatsappConfigUpdateSchema,
  type WhatsAppConfigUpdateInput,
} from "@/schemas/whatsapp-config";
import type { WhatsAppConfig } from "@/generated/prisma/client";

export type WhatsAppConfigDto = {
  displayName: string;
  phoneNumber: string;
  signature: string | null;
};

function toDto(record: WhatsAppConfig): WhatsAppConfigDto {
  return {
    displayName: record.displayName,
    phoneNumber: record.phoneNumber,
    signature: record.signature,
  };
}

export class WhatsAppConfigService {
  async getConfig(): Promise<WhatsAppConfigDto | null> {
    const record = await getWhatsAppConfig();
    return record ? toDto(record) : null;
  }

  async updateConfig(
    input: WhatsAppConfigUpdateInput,
    actorId: string,
  ): Promise<WhatsAppConfigDto> {
    const parsed = whatsappConfigUpdateSchema.safeParse(input);
    if (!parsed.success) {
      throw new WhatsAppConfigValidationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
      );
    }

    const record = await upsertWhatsAppConfig({
      displayName: parsed.data.displayName,
      phoneNumber: parsed.data.phoneNumber,
      signature: parsed.data.signature || null,
    });

    await auditLog({
      actorId,
      action: "whatsappConfig.updated",
      entity: "WhatsAppConfig",
      entityId: record.id,
      payload: { displayName: record.displayName },
    });

    return toDto(record);
  }
}

let serviceInstance: WhatsAppConfigService | null = null;

export function getWhatsAppConfigService(): WhatsAppConfigService {
  if (!serviceInstance) {
    serviceInstance = new WhatsAppConfigService();
  }
  return serviceInstance;
}

export function resetWhatsAppConfigServiceForTests(): void {
  serviceInstance = null;
}
