"use server";

// Server Actions de upload/remoção de arquivos — protegidas por RBAC no servidor.
import { FileAssetType } from "@/generated/prisma/enums";
import {
  FileValidationError,
  StorageOperationError,
} from "@/lib/file-errors";
import { fileAssetTypeSchema } from "@/schemas/file-upload";
import { requirePermission } from "@/services/auth";
import {
  getFileStorageService,
} from "@/services/file-storage";

export type FileAssetDto = {
  id: string;
  url: string;
  type: FileAssetType;
  filename: string | null;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
};

export type UploadFileActionResult =
  | { success: true; fileAsset: FileAssetDto }
  | { success: false; error: string };

export type DeleteFileActionResult =
  | { success: true }
  | { success: false; error: string };

function toDto(fileAsset: {
  id: string;
  url: string;
  type: FileAssetType;
  filename: string | null;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
}): FileAssetDto {
  return {
    id: fileAsset.id,
    url: fileAsset.url,
    type: fileAsset.type,
    filename: fileAsset.filename,
    mimeType: fileAsset.mimeType,
    size: fileAsset.size,
    width: fileAsset.width,
    height: fileAsset.height,
  };
}

/// Faz upload server-side: valida, otimiza imagem, envia ao R2 e persiste metadados.
export async function uploadFileAction(
  formData: FormData,
): Promise<UploadFileActionResult> {
  try {
    const user = await requirePermission("files:write");

    const file = formData.get("file");
    const typeRaw = formData.get("type");

    if (!(file instanceof File)) {
      return { success: false, error: "Nenhum arquivo enviado." };
    }

    const typeParsed = fileAssetTypeSchema.safeParse(typeRaw);
    if (!typeParsed.success) {
      return { success: false, error: "Tipo de arquivo inválido." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    const result = await getFileStorageService().uploadAndPersist({
      buffer,
      originalName: file.name,
      mimeType,
      type: typeParsed.data,
      uploadedById: user.id,
    });

    return { success: true, fileAsset: toDto(result.fileAsset) };
  } catch (error) {
    if (error instanceof FileValidationError) {
      return { success: false, error: error.message };
    }
    if (error instanceof StorageOperationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Não foi possível enviar o arquivo." };
  }
}

/// Remove FileAsset e objeto correspondente no R2.
export async function deleteFileAction(
  fileAssetId: string,
): Promise<DeleteFileActionResult> {
  try {
    await requirePermission("files:write");

    if (!fileAssetId) {
      return { success: false, error: "Identificador inválido." };
    }

    await getFileStorageService().removeFileAsset(fileAssetId);
    return { success: true };
  } catch (error) {
    if (error instanceof FileValidationError) {
      return { success: false, error: error.message };
    }
    if (error instanceof StorageOperationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Não foi possível remover o arquivo." };
  }
}
