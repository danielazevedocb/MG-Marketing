import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth-errors";

// Mock da configuração do Auth.js: controla a sessão retornada por `auth()`.
const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

import {
  getCurrentUser,
  requireAuth,
  requirePermission,
  requireRole,
} from "@/services/auth";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

describe("serviço de autenticação/autorização", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("getCurrentUser retorna usuário e papel a partir de sessão válida", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Comercial));

    const user = await getCurrentUser();

    expect(user).toMatchObject({ id: "user-1", role: Role.Comercial });
  });

  it("getCurrentUser retorna null sem sessão", async () => {
    authMock.mockResolvedValue(null);
    expect(await getCurrentUser()).toBeNull();
  });

  it("requireAuth lança 401 sem sessão", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("requirePermission bloqueia Visualizador (403) em ação de escrita", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    await expect(requirePermission("contacts:write")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("requirePermission autoriza Administrador em ações suportadas", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Administrador));
    const user = await requirePermission("users:write");
    expect(user.role).toBe(Role.Administrador);
  });

  it("requireRole autoriza papel permitido e bloqueia os demais", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));
    await expect(
      requireRole([Role.Marketing, Role.Administrador]),
    ).resolves.toMatchObject({ role: Role.Marketing });

    authMock.mockResolvedValue(sessionFor(Role.Visualizador));
    await expect(requireRole(Role.Administrador)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
