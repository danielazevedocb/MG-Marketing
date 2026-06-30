import { beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignStatus, Channel, SendStatus } from "@/generated/prisma/enums";

const countCampaignsByStatusMock = vi.fn();
const countTemplatesMock = vi.fn();
const countContactsMock = vi.fn();
const countSendsTodayMock = vi.fn();
const getSendTimeSeriesMock = vi.fn();
const listRecentSendsMock = vi.fn();
const listScheduledCampaignsMock = vi.fn();
const listRecentActivityMock = vi.fn();

vi.mock("@/repositories/dashboard", () => ({
  countCampaignsByStatus: (...args: unknown[]) =>
    countCampaignsByStatusMock(...args),
  countTemplates: (...args: unknown[]) => countTemplatesMock(...args),
  countContacts: (...args: unknown[]) => countContactsMock(...args),
  countSendsToday: (...args: unknown[]) => countSendsTodayMock(...args),
  getSendTimeSeries: (...args: unknown[]) => getSendTimeSeriesMock(...args),
  listRecentSends: (...args: unknown[]) => listRecentSendsMock(...args),
  listScheduledCampaigns: (...args: unknown[]) =>
    listScheduledCampaignsMock(...args),
  listRecentActivity: (...args: unknown[]) => listRecentActivityMock(...args),
}));

import { DashboardService } from "@/services/dashboard";

const sentAt = new Date("2026-06-30T10:00:00.000Z");
const scheduledAt = new Date("2026-07-01T15:00:00.000Z");

describe("DashboardService", () => {
  const service = new DashboardService();

  beforeEach(() => {
    vi.clearAllMocks();
    countCampaignsByStatusMock.mockResolvedValue({
      total: 12,
      draft: 3,
      scheduled: 2,
      sent: 7,
    });
    countTemplatesMock.mockResolvedValue(8);
    countContactsMock.mockResolvedValue(150);
    countSendsTodayMock.mockResolvedValue(5);
    getSendTimeSeriesMock.mockResolvedValue([
      { date: "2026-06-29", count: 2 },
      { date: "2026-06-30", count: 5 },
    ]);
    listRecentSendsMock.mockResolvedValue([
      {
        id: "send-1",
        sentAt,
        campaignId: "campaign-1",
        campaignName: "Campanha Verão",
        userId: "user-1",
        userName: "Maria",
        userEmail: "maria@mg.com",
        channel: Channel.WhatsApp,
        recipient: "+5511999999999",
        status: SendStatus.Enviado,
        returnMessage: "OK",
      },
    ]);
    listScheduledCampaignsMock.mockResolvedValue([
      {
        id: "campaign-scheduled",
        nome: "Lançamento Julho",
        status: CampaignStatus.scheduled,
        scheduledAt,
        channel: Channel.Email,
        channels: [Channel.Email],
      },
    ]);
    listRecentActivityMock.mockResolvedValue([
      {
        id: "audit-1",
        createdAt: sentAt,
        actorId: "user-1",
        actorName: "Maria",
        actorEmail: "maria@mg.com",
        action: "campaign.create",
        entity: "Campaign",
        entityId: "campaign-1",
        payload: null,
      },
    ]);
  });

  it("calcula indicadores com as contagens corretas", async () => {
    const indicators = await service.getIndicators();

    expect(indicators).toEqual({
      campaignsTotal: 12,
      campaignsSent: 7,
      campaignsScheduled: 2,
      campaignsDraft: 3,
      templatesTotal: 8,
      contactsTotal: 150,
      sendsToday: 5,
    });
  });

  it("agrega envios por dia na série temporal", async () => {
    const series = await service.getSendTimeSeries(14);

    expect(getSendTimeSeriesMock).toHaveBeenCalledWith(14);
    expect(series).toEqual([
      { date: "2026-06-29", count: 2 },
      { date: "2026-06-30", count: 5 },
    ]);
  });

  it("retorna últimos envios e campanhas agendadas esperados", async () => {
    const [recentSends, scheduledCampaigns] = await Promise.all([
      service.getRecentSends(5),
      service.getScheduledCampaigns(5),
    ]);

    expect(listRecentSendsMock).toHaveBeenCalledWith(5);
    expect(listScheduledCampaignsMock).toHaveBeenCalledWith(5);
    expect(recentSends[0]).toMatchObject({
      id: "send-1",
      campaignName: "Campanha Verão",
      channel: Channel.WhatsApp,
      status: SendStatus.Enviado,
    });
    expect(recentSends[0]?.sentAt).toBe(sentAt.toISOString());
    expect(scheduledCampaigns[0]).toMatchObject({
      id: "campaign-scheduled",
      nome: "Lançamento Julho",
    });
    expect(scheduledCampaigns[0]?.scheduledAt).toBe(scheduledAt.toISOString());
  });
});
