import { beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignType, Role } from "@/generated/prisma/enums";
import { ForbiddenError } from "@/lib/auth-errors";

const authMock = vi.fn();
const campaignServiceMock = {
  createDraft: vi.fn(),
  saveDraft: vi.fn(),
  advanceWizardStep: vi.fn(),
  duplicateCampaign: vi.fn(),
  scheduleCampaign: vi.fn(),
  cancelScheduledCampaign: vi.fn(),
  rescheduleCampaign: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/campaigns", () => ({
  getCampaignService: () => campaignServiceMock,
}));

import {
  advanceCampaignWizardStepAction,
  cancelScheduledCampaignAction,
  createCampaignDraftAction,
  duplicateCampaignAction,
  rescheduleCampaignAction,
  saveCampaignDraftAction,
  scheduleCampaignAction,
} from "@/actions/campaigns";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

const draftState = {
  nome: "Campanha",
  type: CampaignType.Geral,
  templateId: "",
  field: {
    titulo: "Título",
    subtitulo: "",
    texto: "Texto",
    banner: "",
    imagem: "",
    imagens: [],
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
  wizardStep: "criar" as const,
  scheduledAt: "",
};

describe("RBAC das actions de campanhas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Visualizador não pode criar campanha (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await createCampaignDraftAction("Nova campanha");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(campaignServiceMock.createDraft).not.toHaveBeenCalled();
  });

  it("Visualizador não pode salvar rascunho (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await saveCampaignDraftAction("campaign-1", draftState);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Visualizador não pode avançar wizard (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await advanceCampaignWizardStepAction(
      "campaign-1",
      "criar",
      {
        nome: "Teste",
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Visualizador não pode duplicar campanha (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await duplicateCampaignAction("campaign-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Marketing pode criar campanha", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));
    campaignServiceMock.createDraft.mockResolvedValue({
      id: "campaign-1",
      nome: "Nova campanha",
    });

    const result = await createCampaignDraftAction("Nova campanha");

    expect(result.success).toBe(true);
    expect(campaignServiceMock.createDraft).toHaveBeenCalledOnce();
  });

  it("Visualizador não pode agendar campanha (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const result = await scheduleCampaignAction("campaign-1", future);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(campaignServiceMock.scheduleCampaign).not.toHaveBeenCalled();
  });

  it("Visualizador não pode cancelar agendamento (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await cancelScheduledCampaignAction("campaign-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(campaignServiceMock.cancelScheduledCampaign).not.toHaveBeenCalled();
  });

  it("Visualizador não pode reagendar campanha (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const result = await rescheduleCampaignAction("campaign-1", future);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(campaignServiceMock.rescheduleCampaign).not.toHaveBeenCalled();
  });
});

describe("requirePermission direto (campanhas)", () => {
  it("lança ForbiddenError para Visualizador em campaigns:write", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    const { requirePermission } = await import("@/services/auth");
    await expect(requirePermission("campaigns:write")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
