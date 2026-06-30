// Orquestração de upload/remoção: validação, otimização, R2 e persistência de metadados.
import type { FileAsset } from "@/generated/prisma/client";
import { FileAssetType } from "@/generated/prisma/enums";
import { FileValidationError } from "@/lib/file-errors";
import {
  createFileAsset,
  deleteFileAsset,
  findFileAssetById,
  type CreateFileAssetInput,
} from "@/repositories/file-asset";
import {
  uploadFileMetadataSchema,
  validateFileMetadata,
} from "@/schemas/file-upload";
import {
  getStorageService,
  type R2StorageService,
} from "@/services/storage";
import { optimizeImage, isOptimizableImage } from "@/utils/image-optimization";

export type ProcessUploadInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  type: FileAssetType;
  uploadedById: string;
};

export type ProcessUploadResult = {
  fileAsset: FileAsset;
};

export type FileStorageServiceDeps = {
  storage: R2StorageService;
};

export class FileStorageService {
  constructor(private readonly deps: FileStorageServiceDeps) {}

  async uploadAndPersist(input: ProcessUploadInput): Promise<ProcessUploadResult> {
    const metadata = validateFileMetadata(
      uploadFileMetadataSchema.parse({
        type: input.type,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.buffer.byteLength,
      }),
    );

    let body = input.buffer;
    let mimeType = metadata.mimeType;
    let size = metadata.size;
    let width: number | null = null;
    let height: number | null = null;

    if (isOptimizableImage(mimeType)) {
      const optimized = await optimizeImage(body, mimeType);
      body = optimized.buffer;
      mimeType = optimized.mimeType;
      size = optimized.size;
      width = optimized.width || null;
      height = optimized.height || null;
    }

    const uploaded = await this.deps.storage.upload({
      key: "",
      body,
      contentType: mimeType,
      originalName: metadata.originalName,
    });

    const fileAsset = await createFileAsset({
      url: uploaded.url,
      type: metadata.type,
      filename: metadata.originalName,
      mimeType,
      size,
      width,
      height,
      uploadedById: input.uploadedById,
    });

    return { fileAsset };
  }

  async removeFileAsset(id: string): Promise<void> {
    const fileAsset = await findFileAssetById(id);
    if (!fileAsset) {
      throw new FileValidationError("Arquivo não encontrado");
    }

    await this.deps.storage.removeByUrl(fileAsset.url);
    await deleteFileAsset(id);
  }
}

export function createDefaultFileStorageService(): FileStorageService {
  return new FileStorageService({ storage: getStorageService() });
}

let defaultFileStorageService: FileStorageService | null = null;

export function getFileStorageService(): FileStorageService {
  if (!defaultFileStorageService) {
    defaultFileStorageService = createDefaultFileStorageService();
  }
  return defaultFileStorageService;
}

export function setFileStorageServiceForTests(
  service: FileStorageService | null,
): void {
  defaultFileStorageService = service;
}

/// Converte erros de validação Zod/customizados em FileValidationError.
export function toFileValidationError(error: unknown): FileValidationError {
  if (error instanceof FileValidationError) {
    return error;
  }
  if (error instanceof Error) {
    return new FileValidationError(error.message);
  }
  return new FileValidationError("Arquivo inválido");
}

export type { CreateFileAssetInput };
