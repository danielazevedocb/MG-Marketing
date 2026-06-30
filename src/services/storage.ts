// Serviço de storage no Cloudflare R2 — upload/remoção com credenciais no servidor.
import { randomUUID } from "node:crypto";

import {
  buildPublicUrl,
  createDefaultR2Client,
  deleteObject,
  extractKeyFromPublicUrl,
  putObject,
  type R2ClientDeps,
} from "@/lib/r2-client";
import { StorageOperationError } from "@/lib/file-errors";
import type {
  ObjectStorageService,
  StorageUploadInput,
  StorageUploadResult,
} from "@/types/storage";

function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "arquivo";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function buildObjectKey(originalName: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = randomUUID();
  return `uploads/${year}/${month}/${id}-${sanitizeFilename(originalName)}`;
}

export type R2StorageServiceDeps = {
  r2: R2ClientDeps;
};

export class R2StorageService implements ObjectStorageService {
  constructor(private readonly deps: R2StorageServiceDeps) {}

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const key = input.key || buildObjectKey(input.originalName);

    try {
      await putObject(this.deps.r2, {
        key,
        body: input.body,
        contentType: input.contentType,
      });
    } catch {
      throw new StorageOperationError("Falha ao enviar arquivo ao storage");
    }

    return {
      key,
      url: buildPublicUrl(this.deps.r2.config, key),
      size: input.body.byteLength,
      contentType: input.contentType,
    };
  }

  async removeByUrl(url: string): Promise<void> {
    const key = extractKeyFromPublicUrl(this.deps.r2.config, url);
    if (!key) {
      throw new StorageOperationError("URL do arquivo inválida para remoção");
    }

    try {
      await deleteObject(this.deps.r2, key);
    } catch {
      throw new StorageOperationError("Falha ao remover arquivo do storage");
    }
  }
}

/// Factory padrão usando variáveis de ambiente.
export function createDefaultStorageService(): R2StorageService {
  return new R2StorageService({ r2: createDefaultR2Client() });
}

/// Instância singleton para uso em actions/handlers (substituível em testes).
let defaultService: R2StorageService | null = null;

export function getStorageService(): R2StorageService {
  if (!defaultService) {
    defaultService = createDefaultStorageService();
  }
  return defaultService;
}

export function setStorageServiceForTests(service: R2StorageService | null): void {
  defaultService = service;
}

export { buildObjectKey, sanitizeFilename };
