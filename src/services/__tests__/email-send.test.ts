import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProviderType } from "@/generated/prisma/enums";
import { NoActiveEmailProviderError } from "@/lib/sending-errors";
import { emptyFieldInput } from "@/schemas/campaign";

const findActiveEmailProviderMock = vi.fn();
const sendProviderEmailMock = vi.fn();

vi.mock("@/repositories/email-provider", () => ({
  findActiveEmailProvider: (...args: unknown[]) =>
    findActiveEmailProviderMock(...args),
}));

vi.mock("@/services/email-provider-drivers", () => ({
  sendProviderEmail: (...args: unknown[]) => sendProviderEmailMock(...args),
}));

vi.mock("@/services/email-providers", () => ({
  __testables: {
    parseCredentials: () => ({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      user: "user",
      password: "pass",
    }),
  },
}));

import {
  getActiveEmailProviderContext,
  sendCampaignEmail,
} from "@/services/email-send";

describe("email-send service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findActiveEmailProviderMock.mockResolvedValue({
      provider: ProviderType.SMTP,
      fromName: "MG",
      fromEmail: "noreply@mg.com",
      credentialsEncrypted: "encrypted",
    });
    sendProviderEmailMock.mockResolvedValue({
      success: true,
      message: "Email enviado com sucesso.",
      messageId: "smtp-1",
    });
  });

  it("usa provedor ativo mockado para enviar HTML gerado", async () => {
    const content = {
      ...emptyFieldInput(),
      titulo: "Campanha",
      texto: "Conteúdo",
    };

    const result = await sendCampaignEmail({
      to: "dest@example.com",
      subject: "Campanha",
      content,
    });

    expect(result.success).toBe(true);
    expect(sendProviderEmailMock).toHaveBeenCalledWith(
      ProviderType.SMTP,
      expect.objectContaining({
        fromEmail: "noreply@mg.com",
      }),
      expect.objectContaining({
        to: "dest@example.com",
        html: expect.stringContaining("<!DOCTYPE html>"),
      }),
    );
  });

  it("bloqueia envio sem provedor ativo", async () => {
    findActiveEmailProviderMock.mockResolvedValue(null);

    await expect(
      sendCampaignEmail({
        to: "dest@example.com",
        subject: "Campanha",
        content: emptyFieldInput(),
      }),
    ).rejects.toBeInstanceOf(NoActiveEmailProviderError);
  });

  it("retorna contexto do provedor ativo", async () => {
    const context = await getActiveEmailProviderContext();
    expect(context?.provider).toBe(ProviderType.SMTP);
    expect(context?.fromEmail).toBe("noreply@mg.com");
  });
});
