// Repository de agregações do dashboard — consultas otimizadas (count/groupBy).
import type { CampaignWithRelations } from "@/repositories/campaign";
import type { SendHistoryListItem } from "@/repositories/send-history";
import type { AuditLogListItem } from "@/repositories/audit-log";
import { CampaignStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { listAuditLogs } from "@/repositories/audit-log";
import { listCampaigns } from "@/repositories/campaign";
import { listSendHistory } from "@/repositories/send-history";

export type CampaignStatusCounts = {
  total: number;
  draft: number;
  scheduled: number;
  sent: number;
};

export type SendTimeSeriesPoint = {
  date: string;
  count: number;
};

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function countCampaignsByStatus(): Promise<CampaignStatusCounts> {
  const [total, grouped] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const counts = {
    draft: 0,
    scheduled: 0,
    sent: 0,
  };

  for (const row of grouped) {
    counts[row.status] = row._count.status;
  }

  return { total, ...counts };
}

export async function countTemplates(): Promise<number> {
  return prisma.template.count();
}

export async function countContacts(): Promise<number> {
  return prisma.contact.count();
}

export async function countSendsToday(): Promise<number> {
  return prisma.sendHistory.count({
    where: {
      sentAt: { gte: startOfToday() },
    },
  });
}

export async function getSendTimeSeries(days = 14): Promise<SendTimeSeriesPoint[]> {
  const end = startOfToday();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const endExclusive = new Date(end);
  endExclusive.setDate(endExclusive.getDate() + 1);

  const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
    SELECT DATE("sentAt") AS day, COUNT(*)::bigint AS count
    FROM "SendHistory"
    WHERE "sentAt" >= ${start} AND "sentAt" < ${endExclusive}
    GROUP BY DATE("sentAt")
    ORDER BY day ASC
  `;

  const countByDay = new Map<string, number>();
  for (const row of rows) {
    const key = startOfDay(new Date(row.day)).toISOString().slice(0, 10);
    countByDay.set(key, Number(row.count));
  }

  const points: SendTimeSeriesPoint[] = [];
  for (let index = 0; index < days; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    points.push({
      date: key,
      count: countByDay.get(key) ?? 0,
    });
  }

  return points;
}

export async function listRecentSends(
  take = 5,
): Promise<SendHistoryListItem[]> {
  const result = await listSendHistory({ take, skip: 0 });
  return result.items;
}

export async function listScheduledCampaigns(
  take = 5,
): Promise<CampaignWithRelations[]> {
  const result = await listCampaigns({
    status: CampaignStatus.scheduled,
    take,
  });
  return result.items;
}

export async function listRecentActivity(
  take = 10,
): Promise<AuditLogListItem[]> {
  const result = await listAuditLogs({ take, skip: 0 });
  return result.items;
}
