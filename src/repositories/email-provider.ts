// Repository de provedores de email — acesso a dados via Prisma.
import type { EmailProvider, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateEmailProviderData = {
  name: string;
  provider: Prisma.EmailProviderCreateInput["provider"];
  fromName: string;
  fromEmail: string;
  credentialsEncrypted: string;
  active?: boolean;
};

export type UpdateEmailProviderData = Partial<
  Omit<CreateEmailProviderData, "provider">
>;

export async function createEmailProvider(
  data: CreateEmailProviderData,
): Promise<EmailProvider> {
  return prisma.emailProvider.create({ data });
}

export async function updateEmailProvider(
  id: string,
  data: UpdateEmailProviderData,
): Promise<EmailProvider> {
  return prisma.emailProvider.update({ where: { id }, data });
}

export async function deleteEmailProvider(id: string): Promise<EmailProvider> {
  return prisma.emailProvider.delete({ where: { id } });
}

export async function findEmailProviderById(
  id: string,
): Promise<EmailProvider | null> {
  return prisma.emailProvider.findUnique({ where: { id } });
}

export async function listEmailProviders(): Promise<EmailProvider[]> {
  return prisma.emailProvider.findMany({
    orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
  });
}

export async function findActiveEmailProvider(): Promise<EmailProvider | null> {
  return prisma.emailProvider.findFirst({ where: { active: true } });
}

/// Ativa um provedor e desativa todos os demais (unicidade garantida em transação).
export async function setActiveEmailProvider(id: string): Promise<EmailProvider> {
  return prisma.$transaction(async (tx) => {
    await tx.emailProvider.updateMany({
      where: { active: true, NOT: { id } },
      data: { active: false },
    });

    return tx.emailProvider.update({
      where: { id },
      data: { active: true },
    });
  });
}
