import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignStatus,
  CampaignType,
  Channel,
} from "@/generated/prisma/enums";

const createCampaignMock = vi.fn();
const updateCampaignMock = vi.fn();
const findCampaignByIdMock = vi.fn();
const duplicateCampaignRecordMock = vi.fn();
const findContactIdsByGroupIdsMock = vi.fn();
const findContactsByIdsMock = vi.fn();
const findExistingGroupIdsMock = vi.fn();
const findTemplateByIdMock = vi.fn();
const createAuditLogMock = vi.fn();

vi.mock("@/repositories/campaign", () => ({
  createCampaign: (...args: unknown[]) => createCampaignMock(...args),
  updateCampaign: (...args: unknown[]) => updateCampaignMock(...args),
  findCampaignById: (...args: unknown[]) => findCampaignByIdMock(...args),
  duplicateCampaignRecord: (...args: unknown[]) =>
    duplicateCampaignRecordMock(...args),
  deleteCampaign: vi.fn(),
  listCampaigns: vi.fn(),
}));

vi.mock("@/repositories/contact", () => ({
  findContactIdsByGroupIds: (...args: unknown[]) =>
    findContactIdsByGroupIdsMock(...args),
  findContactsByIds: (...args: unknown[]) => findContactsByIdsMock(...args),
}));

vi.mock("@/repositories/group", () => ({
  findExistingGroupIds: (...args: unknown[]) =>
    findExistingGroupIdsMock(...args),
}));

vi.mock("@/repositories/template", () => ({
  findTemplateById: (...args: unknown[]) => findTemplateByIdMock(...args),
}));

vi.mock("@/services/audit-log", () => ({
  auditLog: (...args: unknown[]) => createAuditLogMock(...args),
}));

import { CampaignService, resolveRecipientContactIds } from "@/services/campaigns";

const sampleField = {
  id: "field-1",
  campaignId: "campaign-1",
  titulo: "Título",
  subtitulo: null,
  texto: "Texto",
  banner: null,
  imagem: null,
  link: null,
  botao: null,
  preco: "10",
  desconto: null,
  validade: null,
  observacoes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleCampaign = {
  id: "campaign-1",
  nome: "Campanha teste",
  type: CampaignType.Geral,
  status: CampaignStatus.draft,
  channel: null,
  channels: [] as Channel[],
  templateId: null,
  creatorId: "user-1",
  scheduledAt: null,
  sentAt: null,
  wizardStep: "criar",
  recipientContactIds: [] as string[],
  recipientGroupIds: [] as string[],
  field: sampleField,
  template: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CampaignService", () => {
  let service: CampaignService;

  beforeEach(() => {
    vi.clearAllMocks();
    findContactIdsByGroupIdsMock.mockResolvedValue([]);
    findContactsByIdsMock.mockResolvedValue([]);
    findExistingGroupIdsMock.mockResolvedValue(new Set());
    service = new CampaignService();
  });

  it("salvar rascunho e retomar restaura conteúdo e progresso", async () => {
    findCampaignByIdMock.mockResolvedValue(sampleCampaign);
    updateCampaignMock.mockResolvedValue({
      ...sampleCampaign,
      nome: "Campanha atualizada",
      wizardStep: "conteudo",
      field: { ...sampleField, titulo: "Novo título" },
    });

    const state = {
      nome: "Campanha atualizada",
      type: CampaignType.Geral,
      templateId: "",
      field: {
        titulo: "Novo título",
        subtitulo: "",
        texto: "Texto atualizado",
        banner: "",
        imagem: "",
        link: "",
        botao: "",
        preco: "",
        desconto: "",
        validade: "",
        observacoes: "",
      },
      recipientContactIds: [],
      recipientGroupIds: [],
      channels: [],
      wizardStep: "conteudo" as const,
      scheduledAt: "",
    };

    const result = await service.saveDraft("campaign-1", state, "user-1");

    expect(result.nome).toBe("Campanha atualizada");
    expect(result.wizardStep).toBe("conteudo");
    expect(result.field?.titulo).toBe("Novo título");
    expect(updateCampaignMock).toHaveBeenCalledOnce();
  });

  it("avanço na etapa criar preserva nome com conteúdo vazio", async () => {
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      field: {
        ...sampleField,
        titulo: null,
        texto: null,
      },
    });
    updateCampaignMock.mockResolvedValue({
      ...sampleCampaign,
      nome: "tese",
      wizardStep: "tipo",
    });

    const result = await service.advanceWizardStep(
      "campaign-1",
      "criar",
      { nome: "tese" },
      "user-1",
    );

    expect(result.nextStep).toBe("tipo");
    expect(result.campaign.nome).toBe("tese");
  });

  it("avanço válido preserva estado e avança etapa", async () => {
    findCampaignByIdMock.mockResolvedValue(sampleCampaign);
    updateCampaignMock.mockResolvedValue({
      ...sampleCampaign,
      type: CampaignType.Promocao,
      wizardStep: "template",
    });

    const result = await service.advanceWizardStep(
      "campaign-1",
      "tipo",
      { type: CampaignType.Promocao },
      "user-1",
    );

    expect(result.nextStep).toBe("template");
    expect(result.campaign.type).toBe(CampaignType.Promocao);
  });

  it("etapa inválida lança erro de wizard", async () => {
    findCampaignByIdMock.mockResolvedValue(sampleCampaign);

    await expect(
      service.advanceWizardStep(
        "campaign-1",
        "template",
        { templateId: "" },
        "user-1",
      ),
    ).rejects.toThrow("Selecione um template");
  });

  it("avanço na etapa grupos aceita grupo selecionado sem contatos", async () => {
    const groupId = "seed_group_001";
    findExistingGroupIdsMock.mockResolvedValue(new Set([groupId]));
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      wizardStep: "grupos",
      recipientContactIds: [],
      recipientGroupIds: [],
    });
    updateCampaignMock.mockResolvedValue({
      ...sampleCampaign,
      wizardStep: "canal",
      recipientGroupIds: [groupId],
    });

    const result = await service.advanceWizardStep(
      "campaign-1",
      "grupos",
      { recipientGroupIds: [groupId], recipientContactIds: [] },
      "user-1",
    );

    expect(result.nextStep).toBe("canal");
    expect(result.campaign.recipientGroupIds).toEqual([groupId]);
  });

  it("etapa grupos rejeita grupo inexistente no banco", async () => {
    findExistingGroupIdsMock.mockResolvedValue(new Set());
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      wizardStep: "grupos",
    });

    await expect(
      service.advanceWizardStep(
        "campaign-1",
        "grupos",
        { recipientGroupIds: ["grupo-inexistente"], recipientContactIds: [] },
        "user-1",
      ),
    ).rejects.toThrow("Um ou mais grupos selecionados não existem");
  });

  it("etapa grupos sem seleção lança erro claro", async () => {
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      wizardStep: "grupos",
    });

    await expect(
      service.advanceWizardStep(
        "campaign-1",
        "grupos",
        { recipientGroupIds: [], recipientContactIds: [] },
        "user-1",
      ),
    ).rejects.toThrow("Selecione ao menos um contato ou grupo");
  });

  it("duplicar cria nova campanha em draft sem alterar original", async () => {
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      status: CampaignStatus.sent,
    });
    duplicateCampaignRecordMock.mockResolvedValue({
      ...sampleCampaign,
      id: "campaign-2",
      nome: "Cópia de Campanha teste",
      status: CampaignStatus.draft,
    });

    const result = await service.duplicateCampaign("campaign-1", "user-1");

    expect(result.id).toBe("campaign-2");
    expect(result.status).toBe(CampaignStatus.draft);
    expect(duplicateCampaignRecordMock).toHaveBeenCalledOnce();
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "campaign.duplicated" }),
    );
  });

  it("rejeita campo numérico inválido", () => {
    expect(() =>
      service.validateFieldContent({
        titulo: "Título",
        subtitulo: "",
        texto: "Texto",
        banner: "",
        imagem: "",
        link: "",
        botao: "",
        preco: "inválido",
        desconto: "",
        validade: "",
        observacoes: "",
      }),
    ).toThrow("numérico");
  });

  it("agendamento com data futura define status scheduled", async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    findCampaignByIdMock.mockResolvedValue(sampleCampaign);
    updateCampaignMock.mockResolvedValue({
      ...sampleCampaign,
      status: CampaignStatus.scheduled,
      scheduledAt: new Date(future),
      wizardStep: "enviar",
    });

    const result = await service.scheduleCampaign("campaign-1", future, "user-1");

    expect(result.status).toBe(CampaignStatus.scheduled);
    expect(updateCampaignMock).toHaveBeenCalledWith(
      "campaign-1",
      expect.objectContaining({
        status: CampaignStatus.scheduled,
        scheduledAt: new Date(future),
      }),
    );
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "campaign.scheduled" }),
    );
  });

  it("rejeita agendamento quando o conteúdo está incompleto", async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      field: {
        ...sampleField,
        titulo: null,
        texto: null,
      },
    });

    await expect(
      service.scheduleCampaign("campaign-1", future, "user-1"),
    ).rejects.toThrow("Conteúdo da campanha incompleto");
    expect(updateCampaignMock).not.toHaveBeenCalled();
  });

  it("rejeita agendamento com data no passado", async () => {
    findCampaignByIdMock.mockResolvedValue(sampleCampaign);
    const past = new Date(Date.now() - 60_000).toISOString();

    await expect(
      service.scheduleCampaign("campaign-1", past, "user-1"),
    ).rejects.toThrow("futuro");
    expect(updateCampaignMock).not.toHaveBeenCalled();
  });

  it("cancelar agendamento volta campanha para draft", async () => {
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      status: CampaignStatus.scheduled,
      scheduledAt,
    });
    updateCampaignMock.mockResolvedValue({
      ...sampleCampaign,
      status: CampaignStatus.draft,
      scheduledAt: null,
    });

    const result = await service.cancelScheduledCampaign("campaign-1", "user-1");

    expect(result.status).toBe(CampaignStatus.draft);
    expect(updateCampaignMock).toHaveBeenCalledWith("campaign-1", {
      status: CampaignStatus.draft,
      scheduledAt: null,
    });
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "campaign.schedule_cancelled" }),
    );
  });

  it("reagendar atualiza o horário da campanha", async () => {
    const current = new Date(Date.now() + 60 * 60 * 1000);
    const next = new Date(Date.now() + 2 * 60 * 60 * 1000);
    findCampaignByIdMock.mockResolvedValue({
      ...sampleCampaign,
      status: CampaignStatus.scheduled,
      scheduledAt: current,
    });
    updateCampaignMock.mockResolvedValue({
      ...sampleCampaign,
      status: CampaignStatus.scheduled,
      scheduledAt: next,
    });

    const result = await service.rescheduleCampaign(
      "campaign-1",
      next.toISOString(),
      "user-1",
    );

    expect(result.status).toBe(CampaignStatus.scheduled);
    expect(updateCampaignMock).toHaveBeenCalledWith(
      "campaign-1",
      expect.objectContaining({
        status: CampaignStatus.scheduled,
        scheduledAt: next,
      }),
    );
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "campaign.rescheduled" }),
    );
  });
});

describe("resolveRecipientContactIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("seleção de grupo expande para contatos do grupo", async () => {
    findContactIdsByGroupIdsMock.mockResolvedValue(["contact-a", "contact-b"]);

    const ids = await resolveRecipientContactIds(
      ["contact-c"],
      ["group-1"],
    );

    expect(ids).toEqual(
      expect.arrayContaining(["contact-a", "contact-b", "contact-c"]),
    );
    expect(ids).toHaveLength(3);
  });
});
