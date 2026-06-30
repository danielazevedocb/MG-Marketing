// Schemas Zod do módulo de histórico e auditoria.
import { z } from "zod";

import { Channel, SendStatus } from "@/generated/prisma/enums";

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const paginationSchema = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
};

export const sendHistoryFiltersSchema = z.object({
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
  channel: z.nativeEnum(Channel).optional(),
  status: z.nativeEnum(SendStatus).optional(),
  userId: z.string().trim().optional(),
  campaignId: z.string().trim().optional(),
  ...paginationSchema,
});

export type SendHistoryFiltersInput = z.infer<typeof sendHistoryFiltersSchema>;

export const sendHistoryExportFiltersSchema = sendHistoryFiltersSchema.omit({
  page: true,
  pageSize: true,
});

export type SendHistoryExportFiltersInput = z.infer<
  typeof sendHistoryExportFiltersSchema
>;

export const auditLogFiltersSchema = z.object({
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
  actorId: z.string().trim().optional(),
  action: z.string().trim().max(120).optional(),
  entity: z.string().trim().max(80).optional(),
  entityId: z.string().trim().optional(),
  ...paginationSchema,
});

export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>;

export const auditLogExportFiltersSchema = auditLogFiltersSchema.omit({
  page: true,
  pageSize: true,
});

export type AuditLogExportFiltersInput = z.infer<
  typeof auditLogExportFiltersSchema
>;

export const SEND_STATUS_LABELS: Record<SendStatus, string> = {
  [SendStatus.Pendente]: "Pendente",
  [SendStatus.Enviado]: "Enviado",
  [SendStatus.Falha]: "Falha",
};
