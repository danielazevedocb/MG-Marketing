import { beforeEach, describe, expect, it, vi } from "vitest";

import { authConfig } from "@/lib/auth.config";

// Mock da sessão para o Route Handler protegido.
const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

import { GET } from "@/app/api/me/route";

type AuthorizedArgs = Parameters<
  NonNullable<NonNullable<typeof authConfig.callbacks>["authorized"]>
>[0];

function authorized(args: {
  loggedIn: boolean;
  pathname: string;
}): boolean | Response {
  const callback = authConfig.callbacks!.authorized!;
  const url = new URL(`http://localhost${args.pathname}`);
  return callback({
    auth: args.loggedIn ? ({ user: { id: "1" } } as never) : null,
    request: { nextUrl: url } as never,
  } as AuthorizedArgs) as boolean | Response;
}

describe("proteção de rotas — middleware (authorized)", () => {
  it("bloqueia rota protegida sem sessão (redireciona ao login)", () => {
    // `false` faz o middleware do Auth.js redirecionar para a página de login.
    expect(authorized({ loggedIn: false, pathname: "/dashboard" })).toBe(false);
  });

  it("permite rota protegida com sessão válida", () => {
    expect(authorized({ loggedIn: true, pathname: "/dashboard" })).toBe(true);
  });

  it("permite acesso público ao login sem sessão", () => {
    expect(authorized({ loggedIn: false, pathname: "/login" })).toBe(true);
  });

  it("redireciona usuário autenticado para fora do login", () => {
    const result = authorized({ loggedIn: true, pathname: "/login" });
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBeGreaterThanOrEqual(300);
  });

  it("permite landing page pública /c/[slug] sem sessão", () => {
    expect(
      authorized({ loggedIn: false, pathname: `/c/${"a".repeat(32)}` }),
    ).toBe(true);
  });

  it("permite landing page pública /c/[slug] com sessão (sem redirect)", () => {
    expect(
      authorized({ loggedIn: true, pathname: `/c/${"a".repeat(32)}` }),
    ).toBe(true);
  });
});

describe("proteção de rotas — Route Handler", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("responde 401 sem sessão", async () => {
    authMock.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("retorna o usuário autenticado com sessão válida", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", email: "a@mg.com", role: "Administrador" },
      expires: "2999-01-01T00:00:00.000Z",
    });
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.user.id).toBe("user-1");
  });
});
