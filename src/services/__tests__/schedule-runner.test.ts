import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignStatus,
  CampaignType,
  Channel,
  SendStatus,
} from "@/generated/prisma/enums";

const findDueScheduledCampaignsMock = vi.fn();
const claimScheduledCampaignMock = vi.fn();
const dispatchCampaignMock = vi.fn();
const createAuditLogMock = vi.fn();

vi.mock("@/repositories/campaign", () => ({
  findDueScheduledCampaigns: (...args: unknown[]) =>
    findDueScheduledCampaignsMock(...args),
  claimScheduledCampaign: (...args: unknown[]) =>
    claimScheduledCampaignMock(...args),
}));

vi.mock("@/services/audit-log", () => ({
  auditLog: (...args: unknown[]) => createAuditLogMock(...args),
}));

vi.mock("@/services/channel-dispatch", () => ({
  getChannelDispatchService: () => ({
    dispatchCampaign: (...args: unknown[]) => dispatchCampaignMock(...args),
  }),
}));

import { ScheduleRunnerService } from "@/services/schedule-runner";

const dueCampaign = {
  id: "campaign-1",
  nome: "Campanha agendada",
  type: CampaignType.Geral,
  status: CampaignStatus.scheduled,
  channel: null,
  channels: [Channel.WhatsApp],
  templateId: null,
  creatorId: "user-1",
  scheduledAt: new Date(Date.now() - 60_000),
  sentAt: null,
  wizardStep: "enviar",
  recipientContactIds: ["contact-1"],
  recipientGroupIds: [],
  field: null,
  template: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ScheduleRunnerService", () => {
  let service: ScheduleRunnerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ScheduleRunnerService({
      findDue: findDueScheduledCampaignsMock,
      claim: claimScheduledCampaignMock,
      dispatch: dispatchCampaignMock,
    });
    createAuditLogMock.mockResolvedValue({});
  });

  it("dispara campanhas vencidas via sending e marca sent", async () => {
    findDueScheduledCampaignsMock.mockResolvedValue([dueCampaign]);
    claimScheduledCampaignMock.mockResolvedValue(true);
    dispatchCampaignMock.mockResolvedValue({
      campaignId: "campaign-1",
      items: [
        {
          channel: Channel.WhatsApp,
          recipient: "5511999999999",
          contactId: "contact-1",
          status: SendStatus.Enviado,
          returnMessage: "ok",
        },
      ],
      summary: { total: 1, success: 1, failure: 0 },
    });

    const result = await service.runDueCampaigns();

    expect(result.dispatched).toBe(1);
    expect(dispatchCampaignMock).toHaveBeenCalledWith("campaign-1", "user-1");
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "campaign.scheduled_sent" }),
    );
  });

  it("não duplica envio quando a reivindicação falha (idempotência)", async () => {
    findDueScheduledCampaignsMock.mockResolvedValue([dueCampaign]);
    claimScheduledCampaignMock.mockResolvedValue(false);

    const result = await service.runDueCampaigns();

    expect(result.skipped).toBe(1);
    expect(result.dispatched).toBe(0);
    expect(dispatchCampaignMock).not.toHaveBeenCalled();
  });

  it("registra falha sem interromper outras campanhas", async () => {
    const secondCampaign = { ...dueCampaign, id: "campaign-2" };
    findDueScheduledCampaignsMock.mockResolvedValue([dueCampaign, secondCampaign]);
    claimScheduledCampaignMock.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
    dispatchCampaignMock
      .mockRejectedValueOnce(new Error("Falha de envio"))
      .mockResolvedValueOnce({
        campaignId: "campaign-2",
        items: [],
        summary: { total: 0, success: 0, failure: 0 },
      });

    const result = await service.runDueCampaigns();

    expect(result.failed).toBe(1);
    expect(result.dispatched).toBe(1);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "campaign.scheduled_send_failed" }),
    );
  });
});
