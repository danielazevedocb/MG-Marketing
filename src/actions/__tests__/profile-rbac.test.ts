import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileValidationError } from "@/lib/profile-errors";
import { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
const profileServiceMock = {
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/profile", () => ({
  getProfileService: () => profileServiceMock,
}));

import { changePasswordAction, updateProfileAction } from "@/actions/profile";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

const changePasswordInput = {
  currentPassword: "senhaAtual123",
  newPassword: "senhaNova123",
  confirmPassword: "senhaNova123",
};

describe("Actions de perfil (edição do próprio usuário)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sem sessão retorna 401 e não chama o service", async () => {
    authMock.mockResolvedValue(null);

    const result = await updateProfileAction({ name: "Novo Nome" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
    expect(profileServiceMock.updateProfile).not.toHaveBeenCalled();
  });

  it.each([
    Role.Administrador,
    Role.Marketing,
    Role.Comercial,
    Role.Visualizador,
  ])("%s autenticado edita o próprio nome", async (role) => {
    authMock.mockResolvedValue(sessionFor(role));
    profileServiceMock.updateProfile.mockResolvedValue({
      name: "Novo Nome",
      email: "user@mg.com",
    });

    const result = await updateProfileAction({ name: "Novo Nome" });

    expect(result.success).toBe(true);
    expect(profileServiceMock.updateProfile).toHaveBeenCalledWith("user-1", {
      name: "Novo Nome",
    });
  });

  it("senha atual incorreta retorna mensagem de domínio sem derrubar a request", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    profileServiceMock.changePassword.mockRejectedValue(
      new ProfileValidationError("Senha atual incorreta."),
    );

    const result = await changePasswordAction(changePasswordInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Senha atual incorreta.");
    }
  });

  it("senha trocada com sucesso", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Comercial));
    profileServiceMock.changePassword.mockResolvedValue(undefined);

    const result = await changePasswordAction(changePasswordInput);

    expect(result.success).toBe(true);
    expect(profileServiceMock.changePassword).toHaveBeenCalledWith(
      "user-1",
      changePasswordInput,
    );
  });
});
