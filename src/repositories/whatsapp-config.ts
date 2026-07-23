// Repository da config de WhatsApp (singleton) — acesso a dados via Prisma.
import type { WhatsAppConfig } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type UpsertWhatsAppConfigData = {
  displayName: string;
  phoneNumber: string;
  signature?: string | null;
};

export async function getWhatsAppConfig(): Promise<WhatsAppConfig | null> {
  return prisma.whatsAppConfig.findFirst();
}

export async function upsertWhatsAppConfig(
  data: UpsertWhatsAppConfigData,
): Promise<WhatsAppConfig> {
  const existing = await prisma.whatsAppConfig.findFirst();
  if (!existing) {
    return prisma.whatsAppConfig.create({ data });
  }
  return prisma.whatsAppConfig.update({ where: { id: existing.id }, data });
}
