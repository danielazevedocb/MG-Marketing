// Helper centralizado de auditoria — DRY e sanitização de payloads sensíveis.
import type { Prisma } from "@/generated/prisma/client";
import { createAuditLog } from "@/repositories/audit-log";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "credentials",
  "credentialsEncrypted",
  "secret",
  "secretAccessKey",
  "apiKey",
  "serverToken",
  "token",
]);

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value !== "object") return value;

  const record = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(record)) {
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = "[redacted]";
      continue;
    }
    sanitized[key] = sanitizeValue(nested);
  }

  return sanitized;
}

export type AuditLogParams = {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  payload?: Record<string, unknown>;
};

/// Registra uma entrada de auditoria com payload sanitizado (sem credenciais/segredos).
/// Falha de auditoria não deve derrubar a operação de negócio que a originou —
/// erro é logado e engolido aqui, nunca propagado ao chamador.
export async function auditLog(params: AuditLogParams): Promise<void> {
  const payload = params.payload
    ? (sanitizeValue(params.payload) as Prisma.InputJsonValue)
    : undefined;

  try {
    await createAuditLog({
      actorId: params.actorId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      payload,
    });
  } catch (error) {
    console.error("[auditLog] falha ao registrar auditoria:", error);
  }
}
