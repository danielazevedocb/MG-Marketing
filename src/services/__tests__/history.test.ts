import { beforeEach, describe, expect, it, vi } from "vitest";

import { Channel, SendStatus } from "@/generated/prisma/enums";

const listSendHistoryMock = vi.fn();
const listSendHistoryForExportMock = vi.fn();
const listAuditLogsMock = vi.fn();
const listAuditLogsForExportMock = vi.fn();
const listCampaignsMock = vi.fn();
const listAuditFilterActorsMock = vi.fn();

vi.mock("@/repositories/send-history", () => ({
  listSendHistory: (...args: unknown[]) => listSendHistoryMock(...args),
  listSendHistoryForExport: (...args: unknown[]) =>
    listSendHistoryForExportMock(...args),
}));

vi.mock("@/repositories/audit-log", () => ({
  listAuditLogs: (...args: unknown[]) => listAuditLogsMock(...args),
  listAuditLogsForExport: (...args: unknown[]) =>
    listAuditLogsForExportMock(...args),
  listAuditFilterActors: (...args: unknown[]) =>
    listAuditFilterActorsMock(...args),
}));

vi.mock("@/repositories/campaign", () => ({
  listCampaigns: (...args: unknown[]) => listCampaignsMock(...args),
}));

import { HistoryService } from "@/services/history";

const sentAt = new Date("2026-06-15T14:30:00.000Z");

const sendHistoryRow = {
  id: "history-1",
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
};

describe("HistoryService", () => {
  const service = new HistoryService();

  beforeEach(() => {
    vi.clearAllMocks();
    listSendHistoryMock.mockResolvedValue({ items: [sendHistoryRow], total: 1 });
    listSendHistoryForExportMock.mockResolvedValue([sendHistoryRow]);
    listAuditLogsMock.mockResolvedValue({ items: [], total: 0 });
    listAuditLogsForExportMock.mockResolvedValue([]);
    listCampaignsMock.mockResolvedValue({ items: [], total: 0 });
    listAuditFilterActorsMock.mockResolvedValue([]);
  });

  it("lista histórico com todas as colunas previstas", async () => {
    const result = await service.listSendHistory({ page: 1, pageSize: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: "history-1",
      userName: "Maria",
      campaignName: "Campanha Verão",
      channel: Channel.WhatsApp,
      recipient: "+5511999999999",
      status: SendStatus.Enviado,
      returnMessage: "OK",
    });
    expect(result.items[0]?.sentAt).toBe(sentAt.toISOString());
  });

  it("aplica filtros de período, canal e status na consulta", async () => {
    await service.listSendHistory({
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
      channel: Channel.Email,
      status: SendStatus.Falha,
      page: 1,
      pageSize: 20,
    });

    expect(listSendHistoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: Channel.Email,
        status: SendStatus.Falha,
        dateFrom: expect.any(Date),
        dateTo: expect.any(Date),
        skip: 0,
        take: 20,
      }),
    );
  });

  it("exporta CSV apenas com registros filtrados", async () => {
    listSendHistoryForExportMock.mockResolvedValue([sendHistoryRow]);

    const csv = await service.exportSendHistoryCsv({
      channel: Channel.WhatsApp,
      status: SendStatus.Enviado,
    });

    expect(listSendHistoryForExportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: Channel.WhatsApp,
        status: SendStatus.Enviado,
      }),
    );
    expect(csv).toContain("Campanha Verão");
    expect(csv).toContain("+5511999999999");
    expect(csv).toContain("OK");
  });
});
