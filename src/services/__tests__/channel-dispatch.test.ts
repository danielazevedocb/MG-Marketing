import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignStatus,
  CampaignType,
  Channel,
  ProviderType,
  SendStatus,
} from "@/generated/prisma/enums";
import { CampaignValidationError } from "@/lib/campaign-errors";
import { NoActiveEmailProviderError } from "@/lib/sending-errors";

const findCampaignByIdMock = vi.fn();
const updateCampaignMock = vi.fn();
const findContactsByIdsMock = vi.fn();
const createSendHistoryMock = vi.fn();
const createAuditLogMock = vi.fn();
const resolveRecipientContactIdsMock = vi.fn();
const getActiveEmailProviderContextMock = vi.fn();
const sendCampaignEmailMock = vi.fn();

vi.mock("@/repositories/campaign", () => ({
  findCampaignById: (...args: unknown[]) => findCampaignByIdMock(...args),
  updateCampaign: (...args: unknown[]) => updateCampaignMock(...args),
}));

vi.mock("@/repositories/contact", () => ({
  findContactsByIds: (...args: unknown[]) => findContactsByIdsMock(...args),
}));

vi.mock("@/repositories/send-history", () => ({
  createSendHistory: (...args: unknown[]) => createSendHistoryMock(...args),
}));

vi.mock("@/services/audit-log", () => ({
  auditLog: (...args: unknown[]) => createAuditLogMock(...args),
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
  getActiveEmailProviderContext: (...args: unknown[]) =>
    getActiveEmailProviderContextMock(...args),
  sendCampaignEmail: (...args: unknown[]) => sendCampaignEmailMock(...args),
}));

import { ChannelDispatchService } from "@/services/channel-dispatch";

const baseCampaign = {
  id: "campaign-1",
  nome: "Campanha teste",
  type: CampaignType.Geral,
  status: CampaignStatus.draft,
  channel: null,
  channels: [Channel.WhatsApp, Channel.Email],
  templateId: null,
  creatorId: "user-1",
  scheduledAt: null,
  sentAt: null,
  wizardStep: "enviar",
  recipientContactIds: ["contact-1", "contact-2"],
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

const contacts = [
  {
    id: "contact-1",
    nome: "João",
    empresa: "Empresa A",
    email: "joao@example.com",
    telefone: "(11) 98888-7777",
    status: "Ativo",
    groups: [],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "contact-2",
    nome: "Maria",
    empresa: "Empresa B",
    email: "maria@example.com",
    telefone: "123",
    status: "Ativo",
    groups: [],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("ChannelDispatchService", () => {
  let service: ChannelDispatchService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChannelDispatchService({
      getActiveProvider: getActiveEmailProviderContextMock,
      sendEmail: sendCampaignEmailMock,
      recordHistory: createSendHistoryMock,
      updateCampaignStatus: updateCampaignMock,
    });

    findCampaignByIdMock.mockResolvedValue(baseCampaign);
    resolveRecipientContactIdsMock.mockResolvedValue(["contact-1", "contact-2"]);
    findContactsByIdsMock.mockResolvedValue(contacts);
    createSendHistoryMock.mockResolvedValue({});
    updateCampaignMock.mockResolvedValue({
      ...baseCampaign,
      status: CampaignStatus.sent,
    });
    createAuditLogMock.mockResolvedValue({});
    getActiveEmailProviderContextMock.mockResolvedValue({
      provider: ProviderType.SMTP,
      fromName: "MG",
      fromEmail: "noreply@mg.com",
      credentials: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        user: "user",
        password: "pass",
      },
    });
    sendCampaignEmailMock.mockResolvedValue({
      success: true,
      message: "Email enviado com sucesso.",
      messageId: "msg-1",
    });
  });

  it("envia por email com provedor ativo (driver mockado) e registra resultado", async () => {
    const emailOnlyCampaign = {
      ...baseCampaign,
      channels: [Channel.Email],
    };
    findCampaignByIdMock.mockResolvedValue(emailOnlyCampaign);

    const result = await service.dispatchCampaign("campaign-1", "user-1");

    expect(sendCampaignEmailMock).toHaveBeenCalledTimes(2);
    expect(createSendHistoryMock).toHaveBeenCalled();
    expect(
      createSendHistoryMock.mock.calls.some(
        ([entry]) =>
          entry.channel === Channel.Email && entry.status === SendStatus.Enviado,
      ),
    ).toBe(true);
    expect(result.summary.success).toBe(2);
  });

  it("bloqueia envio de email sem provedor ativo quando só email está selecionado", async () => {
    const emailOnlyCampaign = {
      ...baseCampaign,
      channels: [Channel.Email],
    };
    findCampaignByIdMock.mockResolvedValue(emailOnlyCampaign);
    getActiveEmailProviderContextMock.mockResolvedValue(null);

    await expect(
      service.dispatchCampaign("campaign-1", "user-1"),
    ).rejects.toBeInstanceOf(NoActiveEmailProviderError);
    expect(sendCampaignEmailMock).not.toHaveBeenCalled();
  });

  it('canal "ambos" processa WhatsApp e Email sem abortar por falha de destinatário', async () => {
    const result = await service.dispatchCampaign("campaign-1", "user-1");

    expect(result.items).toHaveLength(4);
    expect(
      result.items.filter((item) => item.channel === Channel.WhatsApp),
    ).toHaveLength(2);
    expect(
      result.items.filter((item) => item.channel === Channel.Email),
    ).toHaveLength(2);

    const whatsappFailures = result.items.filter(
      (item) =>
        item.channel === Channel.WhatsApp && item.status === SendStatus.Falha,
    );
    expect(whatsappFailures).toHaveLength(1);
    expect(result.summary.total).toBe(4);
    expect(sendCampaignEmailMock).toHaveBeenCalledTimes(2);
  });

  it("atualiza status da campanha para sent ao concluir", async () => {
    await service.dispatchCampaign("campaign-1", "user-1");

    expect(updateCampaignMock).toHaveBeenCalledWith(
      "campaign-1",
      expect.objectContaining({
        status: CampaignStatus.sent,
        wizardStep: "enviar",
      }),
    );
  });

  it("bloqueia envio quando o conteúdo está incompleto (título/texto vazios)", async () => {
    findCampaignByIdMock.mockResolvedValue({
      ...baseCampaign,
      field: {
        ...baseCampaign.field,
        titulo: null,
        texto: null,
      },
    });

    await expect(
      service.dispatchCampaign("campaign-1", "user-1"),
    ).rejects.toBeInstanceOf(CampaignValidationError);
    await expect(
      service.dispatchCampaign("campaign-1", "user-1"),
    ).rejects.toThrow("Conteúdo da campanha incompleto");
    expect(sendCampaignEmailMock).not.toHaveBeenCalled();
    expect(createSendHistoryMock).not.toHaveBeenCalled();
    expect(updateCampaignMock).not.toHaveBeenCalled();
  });

  it("registra falha de email quando não há provedor ativo no canal ambos", async () => {
    getActiveEmailProviderContextMock.mockResolvedValue(null);

    const result = await service.dispatchCampaign("campaign-1", "user-1");

    const emailItems = result.items.filter((item) => item.channel === Channel.Email);
    expect(emailItems).toHaveLength(2);
    expect(emailItems.every((item) => item.status === SendStatus.Falha)).toBe(true);
    expect(
      emailItems.every((item) =>
        item.returnMessage?.includes("provedor de email ativo"),
      ),
    ).toBe(true);
    expect(
      result.items.some(
        (item) =>
          item.channel === Channel.WhatsApp && item.status === SendStatus.Enviado,
      ),
    ).toBe(true);
  });
});
