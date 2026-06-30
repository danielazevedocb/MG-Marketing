import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProviderType } from "@/generated/prisma/enums";

const createEmailProviderMock = vi.fn();
const updateEmailProviderMock = vi.fn();
const deleteEmailProviderMock = vi.fn();
const findEmailProviderByIdMock = vi.fn();
const listEmailProvidersMock = vi.fn();
const setActiveEmailProviderMock = vi.fn();
const encryptMock = vi.fn();
const decryptMock = vi.fn();
const testProviderConnectionMock = vi.fn();

vi.mock("@/repositories/email-provider", () => ({
  createEmailProvider: (...args: unknown[]) => createEmailProviderMock(...args),
  updateEmailProvider: (...args: unknown[]) => updateEmailProviderMock(...args),
  deleteEmailProvider: (...args: unknown[]) => deleteEmailProviderMock(...args),
  findEmailProviderById: (...args: unknown[]) =>
    findEmailProviderByIdMock(...args),
  listEmailProviders: (...args: unknown[]) => listEmailProvidersMock(...args),
  setActiveEmailProvider: (...args: unknown[]) =>
    setActiveEmailProviderMock(...args),
}));

vi.mock("@/lib/encryption", () => ({
  encrypt: (...args: unknown[]) => encryptMock(...args),
  decrypt: (...args: unknown[]) => decryptMock(...args),
}));

vi.mock("@/services/email-provider-drivers", () => ({
  testProviderConnection: (...args: unknown[]) =>
    testProviderConnectionMock(...args),
}));

vi.mock("@/services/audit-log", () => ({
  auditLog: vi.fn(),
}));

import { EmailProviderService } from "@/services/email-providers";

const smtpCredentials = {
  host: "smtp.exemplo.com",
  port: 587,
  user: "user@exemplo.com",
  password: "segredo",
  secure: false,
};

const sampleRecord = {
  id: "provider-1",
  name: "SMTP principal",
  provider: ProviderType.SMTP,
  active: false,
  fromName: "MG Marketing",
  fromEmail: "marketing@mg.com",
  credentialsEncrypted: "encrypted-payload",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("EmailProviderService", () => {
  let service: EmailProviderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmailProviderService();
    encryptMock.mockImplementation((value: string) => `enc:${value}`);
    decryptMock.mockImplementation(() => JSON.stringify(smtpCredentials));
    testProviderConnectionMock.mockResolvedValue({
      success: true,
      message: "Conexão verificada com sucesso.",
    });
  });

  it("cadastra SMTP válido com credenciais cifradas", async () => {
    createEmailProviderMock.mockResolvedValue(sampleRecord);

    const result = await service.createProvider(
      {
        provider: ProviderType.SMTP,
        name: "SMTP principal",
        fromName: "MG Marketing",
        fromEmail: "marketing@mg.com",
        credentials: smtpCredentials,
      },
      "user-1",
    );

    expect(createEmailProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        credentialsEncrypted: expect.stringContaining("enc:"),
      }),
    );
    expect(result.credentialsMeta.hasCredentials).toBe(true);
    expect(result.credentialsMeta.host).toBe("smtp.exemplo.com");
  });

  it("rejeita cadastro SMTP sem campos obrigatórios", async () => {
    await expect(
      service.createProvider(
        {
          provider: ProviderType.SMTP,
          name: "SMTP",
          fromName: "MG",
          fromEmail: "marketing@mg.com",
          credentials: {
            host: "",
            port: 587,
            user: "user",
            password: "segredo",
            secure: false,
          },
        },
        "user-1",
      ),
    ).rejects.toThrow(/host/i);

    expect(createEmailProviderMock).not.toHaveBeenCalled();
  });

  it("nunca retorna credenciais em claro no DTO", async () => {
    listEmailProvidersMock.mockResolvedValue([sampleRecord]);

    const items = await service.listProviders();
    const serialized = JSON.stringify(items);

    expect(serialized).not.toContain("segredo");
    expect(items[0]?.credentialsMeta).toEqual(
      expect.objectContaining({
        hasCredentials: true,
        host: "smtp.exemplo.com",
        user: "user@exemplo.com",
      }),
    );
  });

  it("ativa provedor garantindo unicidade via repository", async () => {
    findEmailProviderByIdMock.mockResolvedValue(sampleRecord);
    setActiveEmailProviderMock.mockResolvedValue({ ...sampleRecord, active: true });

    const result = await service.activateProvider("provider-1", "user-1");

    expect(setActiveEmailProviderMock).toHaveBeenCalledWith("provider-1");
    expect(result.active).toBe(true);
  });

  it("testar conexão reporta sucesso com driver mockado", async () => {
    findEmailProviderByIdMock.mockResolvedValue(sampleRecord);

    const result = await service.testConnection(
      {
        mode: "saved",
        providerId: "provider-1",
      },
      "user-1",
    );

    expect(testProviderConnectionMock).toHaveBeenCalledWith(
      ProviderType.SMTP,
      expect.objectContaining({
        credentials: smtpCredentials,
      }),
    );
    expect(result.success).toBe(true);
  });

  it("testar conexão reporta falha com driver mockado", async () => {
    testProviderConnectionMock.mockResolvedValue({
      success: false,
      message: "Não foi possível verificar a conexão.",
    });

    const result = await service.testConnection(
      {
        mode: "inline",
        config: {
          provider: ProviderType.Resend,
          name: "Resend",
          fromName: "MG",
          fromEmail: "marketing@mg.com",
          credentials: { apiKey: "re_123" },
        },
      },
      "user-1",
    );

    expect(result.success).toBe(false);
  });
});
