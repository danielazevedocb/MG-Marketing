// Schemas Zod de upload de arquivos — validação no servidor (fonte da verdade).
import { z } from "zod";

import { FileAssetType } from "@/generated/prisma/enums";

/// Limites de tamanho por categoria (bytes).
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10 MB
  pdf: 20 * 1024 * 1024, // 20 MB
  catalog: 20 * 1024 * 1024, // 20 MB
  generic: 25 * 1024 * 1024, // 25 MB
} as const;

/// MIME types permitidos por tipo de FileAsset.
export const ALLOWED_MIME_BY_ASSET_TYPE: Record<
  FileAssetType,
  readonly string[]
> = {
  [FileAssetType.banner]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  // SVG não é aceito: é XML e pode conter <script>, risco de XSS armazenado
  // se um dia for servido/renderizado inline (ver security.md).
  [FileAssetType.logo]: ["image/jpeg", "image/png", "image/webp"],
  [FileAssetType.imagem]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  [FileAssetType.catalogo]: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  [FileAssetType.pdf]: ["application/pdf"],
  [FileAssetType.arquivo]: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

const imageAssetTypes = new Set<FileAssetType>([
  FileAssetType.banner,
  FileAssetType.logo,
  FileAssetType.imagem,
]);

export function getMaxFileSizeForAssetType(type: FileAssetType): number {
  if (imageAssetTypes.has(type)) {
    return FILE_SIZE_LIMITS.image;
  }
  if (type === FileAssetType.pdf) {
    return FILE_SIZE_LIMITS.pdf;
  }
  if (type === FileAssetType.catalogo) {
    return FILE_SIZE_LIMITS.catalog;
  }
  return FILE_SIZE_LIMITS.generic;
}

export const fileAssetTypeSchema = z.nativeEnum(FileAssetType);

export const uploadFileMetadataSchema = z.object({
  type: fileAssetTypeSchema,
  originalName: z.string().min(1, "Nome do arquivo é obrigatório"),
  mimeType: z.string().min(1, "Tipo MIME é obrigatório"),
  size: z.number().int().positive("Tamanho inválido"),
});

export type UploadFileMetadata = z.infer<typeof uploadFileMetadataSchema>;

/// Valida metadados do arquivo contra tipo e tamanho permitidos.
export function validateFileMetadata(
  metadata: UploadFileMetadata,
): UploadFileMetadata {
  const parsed = uploadFileMetadataSchema.parse(metadata);
  const allowedMimes = ALLOWED_MIME_BY_ASSET_TYPE[parsed.type];

  if (!allowedMimes.includes(parsed.mimeType)) {
    throw new Error(
      `Tipo de arquivo não permitido para "${parsed.type}": ${parsed.mimeType}`,
    );
  }

  const maxSize = getMaxFileSizeForAssetType(parsed.type);
  if (parsed.size > maxSize) {
    throw new Error(
      `Arquivo excede o limite de ${Math.round(maxSize / (1024 * 1024))} MB`,
    );
  }

  return parsed;
}
