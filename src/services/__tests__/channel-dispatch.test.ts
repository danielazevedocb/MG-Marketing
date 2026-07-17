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
const claimDraftCampaignForDispatchMock = vi.fn();
const setCampaignPublicSlugMock = vi.fn();
const updateCampaignFieldLinkMock = vi.fn();
const findContactsByIdsMock = vi.fn();
const createSendHistoryMock = vi.fn();
const createAuditLogMock = vi.fn();
const resolveRecipientContactIdsMock = vi.fn();
const getActiveEmailProviderContextMock = vi.fn();
const sendCampaignEmailMock = vi.fn();

vi.mock("@/repositories/campaign", () => ({
  findCampaignById: (...args: unknown[]) => findCampaignByIdMock(...args),
  claimDraftCampaignForDispatch: (...args: unknown[]) =>
    claimDraftCampaignForDispatchMock(...args),
  setCampaignPublicSlug: (...args: unknown[]) =>
    setCampaignPublicSlugMock(...args),
  updateCampaignFieldLink: (...args: unknown[]) =>
    updateCampaignFieldLinkMock(...args),
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
  publicSlug: null,
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
    });

    findCampaignByIdMock.mockResolvedValue(baseCampaign);
    claimDraftCampaignForDispatchMock.mockResolvedValue(true);
    resolveRecipientContactIdsMock.mockResolvedValue([
      "contact-1",
      "contact-2",
    ]);
    findContactsByIdsMock.mockResolvedValue(contacts);
    createSendHistoryMock.mockResolvedValue({});
    createAuditLogMock.mockResolvedValue({});
    setCampaignPublicSlugMock.mockResolvedValue(undefined);
    updateCampaignFieldLinkMock.mockResolvedValue(undefined);
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
          entry.channel === Channel.Email &&
          entry.status === SendStatus.Enviado,
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

  it("reivindica a campanha atomicamente antes de enviar", async () => {
    await service.dispatchCampaign("campaign-1", "user-1");

    expect(claimDraftCampaignForDispatchMock).toHaveBeenCalledWith(
      "campaign-1",
    );
  });

  it("bloqueia envio concorrente quando claim retorna false", async () => {
    claimDraftCampaignForDispatchMock.mockResolvedValue(false);

    await expect(
      service.dispatchCampaign("campaign-1", "user-1"),
    ).rejects.toBeInstanceOf(CampaignValidationError);
    expect(sendCampaignEmailMock).not.toHaveBeenCalled();
    // Efeitos colaterais da landing (slug/link) não devem ser persistidos
    // quando outra requisição já reivindicou a campanha antes desta.
    expect(setCampaignPublicSlugMock).not.toHaveBeenCalled();
    expect(updateCampaignFieldLinkMock).not.toHaveBeenCalled();
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
    expect(claimDraftCampaignForDispatchMock).not.toHaveBeenCalled();
  });

  it("gera landing page pública quando o link está vazio", async () => {
    const result = await service.dispatchCampaign("campaign-1", "user-1");

    expect(setCampaignPublicSlugMock).toHaveBeenCalledTimes(1);
    const [campaignId, slug] = setCampaignPublicSlugMock.mock.calls[0]!;
    expect(campaignId).toBe("campaign-1");
    expect(slug).toMatch(/^[a-f0-9]{32}$/);

    expect(updateCampaignFieldLinkMock).toHaveBeenCalledWith(
      "campaign-1",
      expect.stringContaining(`/c/${slug}`),
      "Saiba mais",
    );

    // O conteúdo enviado por email deve conter o link da landing.
    const [emailInput] = sendCampaignEmailMock.mock.calls[0]!;
    expect(emailInput.content.link).toContain(`/c/${slug}`);
    expect(emailInput.content.botao).toBe("Saiba mais");
    expect(result.summary.total).toBe(4);
  });

  it("respeita link customizado sem gerar landing page", async () => {
    findCampaignByIdMock.mockResolvedValue({
      ...baseCampaign,
      field: {
        ...baseCampaign.field,
        link: "https://exemplo.com/oferta",
        botao: "Comprar agora",
      },
    });

    await service.dispatchCampaign("campaign-1", "user-1");

    expect(setCampaignPublicSlugMock).not.toHaveBeenCalled();
    expect(updateCampaignFieldLinkMock).not.toHaveBeenCalled();

    const [emailInput] = sendCampaignEmailMock.mock.calls[0]!;
    expect(emailInput.content.link).toBe("https://exemplo.com/oferta");
    expect(emailInput.content.botao).toBe("Comprar agora");
  });

  it("reusa slug existente em reenvio sem criar outro", async () => {
    findCampaignByIdMock.mockResolvedValue({
      ...baseCampaign,
      publicSlug: "a".repeat(32),
    });

    await service.dispatchCampaign("campaign-1", "user-1");

    expect(setCampaignPublicSlugMock).not.toHaveBeenCalled();
    expect(updateCampaignFieldLinkMock).toHaveBeenCalledWith(
      "campaign-1",
      expect.stringContaining(`/c/${"a".repeat(32)}`),
      "Saiba mais",
    );
  });

  it("envia para muitos destinatários em paralelo limitado preservando a ordem", async () => {
    const manyContacts = Array.from({ length: 8 }, (_, index) => ({
      id: `contact-${index + 1}`,
      nome: `Contato ${index + 1}`,
      empresa: "Empresa",
      email: `contato${index + 1}@example.com`,
      telefone: "123",
      status: "Ativo",
      groups: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    findCampaignByIdMock.mockResolvedValue({
      ...baseCampaign,
      channels: [Channel.Email],
      recipientContactIds: manyContacts.map((contact) => contact.id),
    });
    resolveRecipientContactIdsMock.mockResolvedValue(
      manyContacts.map((contact) => contact.id),
    );
    findContactsByIdsMock.mockResolvedValue(manyContacts);

    // Simula latência assíncrona variável para expor eventuais problemas de
    // concorrência (resultado fora de ordem, destinatário processado 2x etc.).
    sendCampaignEmailMock.mockImplementation(async ({ to }: { to: string }) => {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
      return { success: true, message: "ok", messageId: `id-${to}` };
    });

    const result = await service.dispatchCampaign("campaign-1", "user-1");

    expect(sendCampaignEmailMock).toHaveBeenCalledTimes(8);
    expect(createSendHistoryMock).toHaveBeenCalledTimes(8);
    expect(result.items.map((item) => item.recipient)).toEqual(
      manyContacts.map((contact) => contact.email),
    );
    expect(result.summary.success).toBe(8);
  });

  it("registra falha de email quando não há provedor ativo no canal ambos", async () => {
    getActiveEmailProviderContextMock.mockResolvedValue(null);

    const result = await service.dispatchCampaign("campaign-1", "user-1");

    const emailItems = result.items.filter(
      (item) => item.channel === Channel.Email,
    );
    expect(emailItems).toHaveLength(2);
    expect(emailItems.every((item) => item.status === SendStatus.Falha)).toBe(
      true,
    );
    expect(
      emailItems.every((item) =>
        item.returnMessage?.includes("provedor de email ativo"),
      ),
    ).toBe(true);
    expect(
      result.items.some(
        (item) =>
          item.channel === Channel.WhatsApp &&
          item.status === SendStatus.Enviado,
      ),
    ).toBe(true);
  });
});
