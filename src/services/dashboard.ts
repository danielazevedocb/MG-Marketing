// Serviço de agregação do dashboard — indicadores, séries e listas de leitura.
import {
  countCampaignsByStatus,
  countContacts,
  countSendsToday,
  countTemplates,
  getSendTimeSeries,
  listRecentActivity,
  listRecentSends,
  listScheduledCampaigns,
  type SendTimeSeriesPoint,
} from "@/repositories/dashboard";
import type { CampaignWithRelations } from "@/repositories/campaign";
import type { AuditLogListItem } from "@/repositories/audit-log";
import type { SendHistoryListItem } from "@/repositories/send-history";
import { dashboardTimeSeriesSchema } from "@/schemas/dashboard";

export type DashboardIndicators = {
  campaignsTotal: number;
  campaignsSent: number;
  campaignsScheduled: number;
  campaignsDraft: number;
  templatesTotal: number;
  contactsTotal: number;
  sendsToday: number;
};

export type DashboardRecentSend = {
  id: string;
  sentAt: string;
  campaignName: string | null;
  channel: SendHistoryListItem["channel"];
  recipient: string;
  status: SendHistoryListItem["status"];
};

export type DashboardScheduledCampaign = {
  id: string;
  nome: string;
  scheduledAt: string | null;
  channel: CampaignWithRelations["channel"];
  channels: CampaignWithRelations["channels"];
};

export type DashboardActivityItem = {
  id: string;
  createdAt: string;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
};

export type DashboardSnapshot = {
  indicators: DashboardIndicators;
  timeSeries: SendTimeSeriesPoint[];
  recentSends: DashboardRecentSend[];
  scheduledCampaigns: DashboardScheduledCampaign[];
  activity: DashboardActivityItem[];
};

function toRecentSend(item: SendHistoryListItem): DashboardRecentSend {
  return {
    id: item.id,
    sentAt: item.sentAt.toISOString(),
    campaignName: item.campaignName,
    channel: item.channel,
    recipient: item.recipient,
    status: item.status,
  };
}

function toScheduledCampaign(
  campaign: CampaignWithRelations,
): DashboardScheduledCampaign {
  return {
    id: campaign.id,
    nome: campaign.nome,
    scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
    channel: campaign.channel,
    channels: campaign.channels,
  };
}

function toActivityItem(item: AuditLogListItem): DashboardActivityItem {
  return {
    id: item.id,
    createdAt: item.createdAt.toISOString(),
    actorName: item.actorName,
    actorEmail: item.actorEmail,
    action: item.action,
    entity: item.entity,
    entityId: item.entityId,
  };
}

export class DashboardService {
  async getIndicators(): Promise<DashboardIndicators> {
    const [campaigns, templatesTotal, contactsTotal, sendsToday] =
      await Promise.all([
        countCampaignsByStatus(),
        countTemplates(),
        countContacts(),
        countSendsToday(),
      ]);

    return {
      campaignsTotal: campaigns.total,
      campaignsSent: campaigns.sent,
      campaignsScheduled: campaigns.scheduled,
      campaignsDraft: campaigns.draft,
      templatesTotal,
      contactsTotal,
      sendsToday,
    };
  }

  async getSendTimeSeries(days = 14): Promise<SendTimeSeriesPoint[]> {
    const parsed = dashboardTimeSeriesSchema.parse({ days });
    return getSendTimeSeries(parsed.days);
  }

  async getRecentSends(limit = 5): Promise<DashboardRecentSend[]> {
    const items = await listRecentSends(limit);
    return items.map(toRecentSend);
  }

  async getScheduledCampaigns(limit = 5): Promise<DashboardScheduledCampaign[]> {
    const items = await listScheduledCampaigns(limit);
    return items.map(toScheduledCampaign);
  }

  async getRecentActivity(limit = 10): Promise<DashboardActivityItem[]> {
    const items = await listRecentActivity(limit);
    return items.map(toActivityItem);
  }

  async getSnapshot(): Promise<DashboardSnapshot> {
    const [indicators, timeSeries, recentSends, scheduledCampaigns, activity] =
      await Promise.all([
        this.getIndicators(),
        this.getSendTimeSeries(),
        this.getRecentSends(),
        this.getScheduledCampaigns(),
        this.getRecentActivity(),
      ]);

    return {
      indicators,
      timeSeries,
      recentSends,
      scheduledCampaigns,
      activity,
    };
  }
}

let dashboardService: DashboardService | null = null;

export function getDashboardService(): DashboardService {
  if (!dashboardService) {
    dashboardService = new DashboardService();
  }
  return dashboardService;
}

export function resetDashboardServiceForTests(): void {
  dashboardService = null;
}
