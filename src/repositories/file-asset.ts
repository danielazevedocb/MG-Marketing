// Repository de FileAsset — persistência de URL pública + metadados (nunca binário).
import type { FileAsset, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateFileAssetInput = {
  url: string;
  type: Prisma.FileAssetCreateInput["type"];
  filename?: string | null;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  uploadedById?: string | null;
};

export async function createFileAsset(
  data: CreateFileAssetInput,
): Promise<FileAsset> {
  return prisma.fileAsset.create({ data });
}

export async function findFileAssetById(
  id: string,
): Promise<FileAsset | null> {
  return prisma.fileAsset.findUnique({ where: { id } });
}

export async function deleteFileAsset(id: string): Promise<FileAsset> {
  return prisma.fileAsset.delete({ where: { id } });
}

export async function listFileAssetsByType(
  type: Prisma.FileAssetCreateInput["type"],
): Promise<FileAsset[]> {
  return prisma.fileAsset.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
  });
}
