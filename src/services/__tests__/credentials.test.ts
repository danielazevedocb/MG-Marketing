import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";

// Mocks de Prisma e bcrypt para isolar a verificação de credenciais.
const findUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

const compare = vi.fn();
vi.mock("bcryptjs", () => ({
  default: { compare: (...args: unknown[]) => compare(...args) },
}));

import { verifyCredentials } from "@/services/credentials";

const baseUser = {
  id: "user-1",
  name: "Maria",
  email: "maria@mg.com",
  image: null,
  role: Role.Marketing,
  passwordHash: "hash-armazenado",
};

describe("verifyCredentials — login por credenciais", () => {
  beforeEach(() => {
    findUnique.mockReset();
    compare.mockReset();
  });

  it("autentica com credenciais válidas e não expõe o hash", async () => {
    findUnique.mockResolvedValue(baseUser);
    compare.mockResolvedValue(true);

    const result = await verifyCredentials({
      email: "maria@mg.com",
      password: "senha-correta",
    });

    expect(result).toEqual({
      id: "user-1",
      name: "Maria",
      email: "maria@mg.com",
      image: null,
      role: Role.Marketing,
    });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("nega quando a senha não confere", async () => {
    findUnique.mockResolvedValue(baseUser);
    compare.mockResolvedValue(false);

    const result = await verifyCredentials({
      email: "maria@mg.com",
      password: "senha-errada",
    });

    expect(result).toBeNull();
  });

  it("nega quando o usuário não existe", async () => {
    findUnique.mockResolvedValue(null);

    const result = await verifyCredentials({
      email: "naoexiste@mg.com",
      password: "qualquer",
    });

    expect(result).toBeNull();
    expect(compare).not.toHaveBeenCalled();
  });

  it("nega entrada inválida sem consultar o banco", async () => {
    const result = await verifyCredentials({ email: "invalido", password: "" });

    expect(result).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });
});
