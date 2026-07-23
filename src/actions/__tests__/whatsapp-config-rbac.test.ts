import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
const whatsappConfigServiceMock = {
  getConfig: vi.fn(),
  updateConfig: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/whatsapp-config", () => ({
  getWhatsAppConfigService: () => whatsappConfigServiceMock,
}));

import {
  getWhatsAppConfigAction,
  updateWhatsAppConfigAction,
} from "@/actions/whatsapp-config";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

const validInput = {
  displayName: "MG Marketing",
  phoneNumber: "(41) 98804-0711",
  signature: "",
};

describe("RBAC das actions de configuração de WhatsApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Comercial não pode ler a configuração (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Comercial));

    const result = await getWhatsAppConfigAction();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(whatsappConfigServiceMock.getConfig).not.toHaveBeenCalled();
  });

  it("Marketing pode ler mas não pode escrever (403 na escrita)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));
    whatsappConfigServiceMock.getConfig.mockResolvedValue(null);

    const readResult = await getWhatsAppConfigAction();
    expect(readResult.success).toBe(true);

    const writeResult = await updateWhatsAppConfigAction(validInput);
    expect(writeResult.success).toBe(false);
    if (!writeResult.success) {
      expect(writeResult.status).toBe(403);
    }
    expect(whatsappConfigServiceMock.updateConfig).not.toHaveBeenCalled();
  });

  it("Visualizador não pode escrever (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await updateWhatsAppConfigAction(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });

  it("Administrador pode ler e escrever", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Administrador));
    whatsappConfigServiceMock.updateConfig.mockResolvedValue({
      displayName: validInput.displayName,
      phoneNumber: validInput.phoneNumber,
      signature: null,
    });

    const result = await updateWhatsAppConfigAction(validInput);

    expect(result.success).toBe(true);
    expect(whatsappConfigServiceMock.updateConfig).toHaveBeenCalledWith(
      validInput,
      "user-1",
    );
  });
});
