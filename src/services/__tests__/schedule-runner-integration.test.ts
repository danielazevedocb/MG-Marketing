import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignStatus,
  CampaignType,
  Channel,
  SendStatus,
} from "@/generated/prisma/enums";

const findDueScheduledCampaignsMock = vi.fn();
const claimScheduledCampaignMock = vi.fn();
const claimDraftCampaignForDispatchMock = vi.fn();
const createSendHistoryMock = vi.fn();
const findCampaignByIdMock = vi.fn();
const findContactsByIdsMock = vi.fn();
const resolveRecipientContactIdsMock = vi.fn();

vi.mock("@/repositories/campaign", () => ({
  findDueScheduledCampaigns: (...args: unknown[]) =>
    findDueScheduledCampaignsMock(...args),
  claimScheduledCampaign: (...args: unknown[]) =>
    claimScheduledCampaignMock(...args),
  claimDraftCampaignForDispatch: (...args: unknown[]) =>
    claimDraftCampaignForDispatchMock(...args),
  findCampaignById: (...args: unknown[]) => findCampaignByIdMock(...args),
}));

vi.mock("@/repositories/contact", () => ({
  findContactsByIds: (...args: unknown[]) => findContactsByIdsMock(...args),
}));

vi.mock("@/repositories/send-history", () => ({
  createSendHistory: (...args: unknown[]) => createSendHistoryMock(...args),
}));

vi.mock("@/services/audit-log", () => ({
  auditLog: vi.fn(),
}));

vi.mock("@/services/campaigns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/campaigns")>();
  return {
    ...actual,
    resolveRecipientContactIds: (...args: unknown[]) =>
      resolveRecipientContactIdsMock(...args),
  };
});

vi.mock("@/services/email-send", () => ({
  getActiveEmailProviderContext: vi.fn(),
  sendCampaignEmail: vi.fn(),
}));

import { ChannelDispatchService } from "@/services/channel-dispatch";
import { ScheduleRunnerService } from "@/services/schedule-runner";

const baseCampaign = {
  id: "campaign-1",
  nome: "Campanha agendada",
  type: CampaignType.Geral,
  status: CampaignStatus.draft,
  channel: null,
  channels: [Channel.WhatsApp],
  templateId: null,
  creatorId: "user-1",
  scheduledAt: new Date(Date.now() - 60_000),
  sentAt: null,
  wizardStep: "enviar",
  recipientContactIds: ["contact-1"],
  recipientGroupIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  field: {
    id: "field-1",
    campaignId: "campaign-1",
    titulo: "Título",
    subtitulo: null,
    texto: "Corpo",
    banner: null,
    imagem: null,
    link: null,
    botao: null,
    preco: null,
    desconto: null,
    validade: null,
    observacoes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  template: null,
};

describe("Integração runner + sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findDueScheduledCampaignsMock.mockResolvedValue([
      { ...baseCampaign, status: CampaignStatus.scheduled },
    ]);
    claimScheduledCampaignMock.mockResolvedValue(true);
    findCampaignByIdMock.mockResolvedValue(baseCampaign);
    resolveRecipientContactIdsMock.mockResolvedValue(["contact-1"]);
    findContactsByIdsMock.mockResolvedValue([
      {
        id: "contact-1",
        nome: "João",
        empresa: null,
        email: null,
        telefone: "(11) 98888-7777",
        status: "Ativo",
        groups: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    createSendHistoryMock.mockResolvedValue({});
    claimDraftCampaignForDispatchMock.mockResolvedValue(true);
  });

  it("registra resultado da execução em SendHistory", async () => {
    const dispatchService = new ChannelDispatchService({
      recordHistory: createSendHistoryMock,
    });

    const runner = new ScheduleRunnerService({
      findDue: findDueScheduledCampaignsMock,
      claim: claimScheduledCampaignMock,
      dispatch: (campaignId, actorId) =>
        dispatchService.dispatchCampaign(campaignId, actorId),
    });

    const result = await runner.runDueCampaigns();

    expect(result.dispatched).toBe(1);
    expect(createSendHistoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignId: "campaign-1",
        channel: Channel.WhatsApp,
        status: SendStatus.Enviado,
      }),
    );
    expect(claimDraftCampaignForDispatchMock).toHaveBeenCalledWith(
      "campaign-1",
    );
  });
});
