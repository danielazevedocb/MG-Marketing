// Repository de histórico de envios — acesso a dados via Prisma.
import type { Prisma, SendHistory } from "@/generated/prisma/client";
import { Channel, SendStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type SendHistoryListQuery = {
  dateFrom?: Date;
  dateTo?: Date;
  channel?: Channel;
  status?: SendStatus;
  userId?: string;
  campaignId?: string;
  skip?: number;
  take?: number;
};

export type SendHistoryListItem = {
  id: string;
  sentAt: Date;
  campaignId: string | null;
  campaignName: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  channel: Channel;
  recipient: string;
  status: SendStatus;
  returnMessage: string | null;
};

export type SendHistoryListResult = {
  items: SendHistoryListItem[];
  total: number;
};

const sendHistoryInclude = {
  campaign: { select: { id: true, nome: true } },
  user: { select: { id: true, name: true, email: true } },
} as const;

function buildSendHistoryWhere(
  query: Omit<SendHistoryListQuery, "skip" | "take">,
): Prisma.SendHistoryWhereInput {
  const where: Prisma.SendHistoryWhereInput = {};

  if (query.dateFrom || query.dateTo) {
    where.sentAt = {};
    if (query.dateFrom) where.sentAt.gte = query.dateFrom;
    if (query.dateTo) where.sentAt.lte = query.dateTo;
  }

  if (query.channel) where.channel = query.channel;
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;
  if (query.campaignId) where.campaignId = query.campaignId;

  return where;
}

function mapSendHistoryRow(
  row: Prisma.SendHistoryGetPayload<{ include: typeof sendHistoryInclude }>,
): SendHistoryListItem {
  return {
    id: row.id,
    sentAt: row.sentAt,
    campaignId: row.campaignId,
    campaignName: row.campaign?.nome ?? null,
    userId: row.userId,
    userName: row.user?.name ?? null,
    userEmail: row.user?.email ?? null,
    channel: row.channel,
    recipient: row.recipient,
    status: row.status,
    returnMessage: row.returnMessage,
  };
}

export type CreateSendHistoryData = {
  campaignId?: string | null;
  userId?: string | null;
  channel: Channel;
  recipient: string;
  status: SendStatus;
  returnMessage?: string | null;
  sentAt?: Date;
};

export async function createSendHistory(
  data: CreateSendHistoryData,
): Promise<SendHistory> {
  return prisma.sendHistory.create({ data });
}

export async function createSendHistoryBatch(
  items: CreateSendHistoryData[],
): Promise<number> {
  if (items.length === 0) return 0;

  const result = await prisma.sendHistory.createMany({ data: items });
  return result.count;
}

export async function listSendHistory(
  query: SendHistoryListQuery,
): Promise<SendHistoryListResult> {
  const where = buildSendHistoryWhere(query);
  const skip = query.skip ?? 0;
  const take = query.take ?? 20;

  const [rows, total] = await Promise.all([
    prisma.sendHistory.findMany({
      where,
      skip,
      take,
      orderBy: { sentAt: "desc" },
      include: sendHistoryInclude,
    }),
    prisma.sendHistory.count({ where }),
  ]);

  return {
    items: rows.map(mapSendHistoryRow),
    total,
  };
}

export async function listSendHistoryForExport(
  query: Omit<SendHistoryListQuery, "skip" | "take">,
  limit = 10_000,
): Promise<SendHistoryListItem[]> {
  const rows = await prisma.sendHistory.findMany({
    where: buildSendHistoryWhere(query),
    orderBy: { sentAt: "desc" },
    take: limit,
    include: sendHistoryInclude,
  });

  return rows.map(mapSendHistoryRow);
}
