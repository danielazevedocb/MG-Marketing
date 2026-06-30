// Repository de AuditLog — registro de ações sensíveis no domínio.
import type { AuditLog, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditLogListQuery = {
  dateFrom?: Date;
  dateTo?: Date;
  actorId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  skip?: number;
  take?: number;
};

export type AuditLogListItem = {
  id: string;
  createdAt: Date;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  payload: Prisma.JsonValue | null;
};

export type AuditLogListResult = {
  items: AuditLogListItem[];
  total: number;
};

const auditLogInclude = {
  actor: { select: { id: true, name: true, email: true } },
} as const;

function buildAuditLogWhere(
  query: Omit<AuditLogListQuery, "skip" | "take">,
): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = query.dateFrom;
    if (query.dateTo) where.createdAt.lte = query.dateTo;
  }

  if (query.actorId) where.actorId = query.actorId;
  if (query.action) where.action = { contains: query.action, mode: "insensitive" };
  if (query.entity) where.entity = { equals: query.entity, mode: "insensitive" };
  if (query.entityId) where.entityId = query.entityId;

  return where;
}

function mapAuditLogRow(
  row: Prisma.AuditLogGetPayload<{ include: typeof auditLogInclude }>,
): AuditLogListItem {
  return {
    id: row.id,
    createdAt: row.createdAt,
    actorId: row.actorId,
    actorName: row.actor?.name ?? null,
    actorEmail: row.actor?.email ?? null,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    payload: row.payload,
  };
}

export type CreateAuditLogInput = {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  payload?: Prisma.InputJsonValue;
};

export async function createAuditLog(
  data: CreateAuditLogInput,
): Promise<AuditLog> {
  return prisma.auditLog.create({ data });
}

export async function listAuditLogs(
  query: AuditLogListQuery,
): Promise<AuditLogListResult> {
  const where = buildAuditLogWhere(query);
  const skip = query.skip ?? 0;
  const take = query.take ?? 20;

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: auditLogInclude,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: rows.map(mapAuditLogRow),
    total,
  };
}

export async function listAuditLogsForExport(
  query: Omit<AuditLogListQuery, "skip" | "take">,
  limit = 10_000,
): Promise<AuditLogListItem[]> {
  const rows = await prisma.auditLog.findMany({
    where: buildAuditLogWhere(query),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: auditLogInclude,
  });

  return rows.map(mapAuditLogRow);
}

export async function listAuditFilterActors(): Promise<
  Array<{ id: string; name: string | null; email: string }>
> {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}
