import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
const globalSearchMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/search", () => ({
  globalSearch: (...args: unknown[]) => globalSearchMock(...args),
}));

import { globalSearchAction } from "@/actions/search";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

describe("globalSearchAction RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalSearchMock.mockResolvedValue({ groups: [], total: 0 });
  });

  it("delega busca ao serviço com papel do usuário autenticado", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));

    const result = await globalSearchAction({ query: "promo", limit: 5 });

    expect(result.success).toBe(true);
    expect(globalSearchMock).toHaveBeenCalledWith(
      { query: "promo", limit: 5 },
      Role.Marketing,
    );
  });

  it("retorna 401 sem sessão", async () => {
    authMock.mockResolvedValue(null);

    const result = await globalSearchAction({ query: "promo", limit: 5 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
    expect(globalSearchMock).not.toHaveBeenCalled();
  });
});
