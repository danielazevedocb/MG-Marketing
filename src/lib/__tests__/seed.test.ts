// Testes do seed (offline, com mock) — validam a IDEMPOTÊNCIA da lógica de seed sem banco.
// O comportamento idempotente real (sem duplicação) também é coberto por teste de integração
// quando `DATABASE_URL_TEST` está definido (ver prisma-integration.test.ts).
import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";

import { seed } from "../../../prisma/seed";

function createMockClient() {
  return {
    user: { upsert: vi.fn().mockResolvedValue({}) },
    group: {
      findUnique: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      upsert: vi.fn().mockResolvedValue({}),
    },
    tag: { upsert: vi.fn().mockResolvedValue({}) },
    template: { upsert: vi.fn().mockResolvedValue({}) },
  };
}

describe("seed idempotente", () => {
  it("usa upsert (update + create) para o usuário Administrador com passwordHash", async () => {
    const prisma = createMockClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);

    expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
    const arg = prisma.user.upsert.mock.calls[0][0];
    expect(arg.where).toEqual({ email: "admin@teste.com" });
    expect(arg.update.role).toBe("Administrador");
    expect(arg.create.role).toBe("Administrador");
    expect(arg.update.passwordHash).toEqual(expect.any(String));
    expect(arg.create.passwordHash).toBe(arg.update.passwordHash);
    await expect(
      bcrypt.compare("Admin@123", arg.create.passwordHash),
    ).resolves.toBe(true);
  });

  it("cria grupos e tags de exemplo via upsert (chave única `nome`)", async () => {
    const prisma = createMockClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);

    expect(prisma.group.upsert).toHaveBeenCalledTimes(3);
    expect(prisma.tag.upsert).toHaveBeenCalledTimes(3);
    for (const call of prisma.group.upsert.mock.calls) {
      expect(call[0].where).toHaveProperty("nome");
    }
  });

  it("executar duas vezes não acumula operações (idempotência)", async () => {
    const prisma = createMockClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);

    // Cada execução repete exatamente o mesmo conjunto de upserts (sem inserts incrementais).
    expect(prisma.user.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.group.upsert).toHaveBeenCalledTimes(6);
    expect(prisma.tag.upsert).toHaveBeenCalledTimes(6);
  });
});
