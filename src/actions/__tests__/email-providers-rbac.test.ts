import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
const emailProviderServiceMock = {
  listProviders: vi.fn(),
  createProvider: vi.fn(),
  updateProvider: vi.fn(),
  deleteProvider: vi.fn(),
  activateProvider: vi.fn(),
  testConnection: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/email-providers", () => ({
  getEmailProviderService: () => emailProviderServiceMock,
}));

import {
  createEmailProviderAction,
  setActiveEmailProviderAction,
  testEmailProviderConnectionAction,
  updateEmailProviderAction,
} from "@/actions/email-providers";
import { ProviderType } from "@/generated/prisma/enums";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

const smtpInput = {
  provider: ProviderType.SMTP,
  name: "SMTP",
  fromName: "MG",
  fromEmail: "marketing@mg.com",
  credentials: {
    host: "smtp.exemplo.com",
    port: 587,
    user: "user",
    password: "segredo",
    secure: false,
  },
} as const;

describe("RBAC das actions de email providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Marketing não pode criar provedor (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));

    const result = await createEmailProviderAction(smtpInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(emailProviderServiceMock.createProvider).not.toHaveBeenCalled();
  });

  it("Comercial não pode editar provedor (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Comercial));

    const result = await updateEmailProviderAction("provider-1", {
      provider: ProviderType.SMTP,
      name: "Novo nome",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Visualizador não pode testar conexão (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await testEmailProviderConnectionAction({
      mode: "saved",
      providerId: "provider-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Administrador pode ativar provedor", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Administrador));
    emailProviderServiceMock.activateProvider.mockResolvedValue({
      id: "provider-1",
      active: true,
    });

    const result = await setActiveEmailProviderAction("provider-1");

    expect(result.success).toBe(true);
    expect(emailProviderServiceMock.activateProvider).toHaveBeenCalledWith(
      "provider-1",
      "user-1",
    );
  });
});
