// Testes de integração do módulo de contatos (exigem DATABASE_URL_TEST).
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ContactStatus } from "@/generated/prisma/enums";
import type { PrismaClient } from "@/generated/prisma/client";

import { createTestPrisma, deployMigrations, hasTestDb } from "./test-db";

const suite = hasTestDb ? describe : describe.skip;

suite("integração de contatos (banco de teste)", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    deployMigrations();
    prisma = createTestPrisma();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
  });

  it("associação a grupo e tag persiste e aparece em filtros", async () => {
    const sufixo = Date.now();
    const group = await prisma.group.create({
      data: { nome: `Grupo Filtro ${sufixo}` },
    });
    const tag = await prisma.tag.create({
      data: { nome: `Tag Filtro ${sufixo}` },
    });

    const contact = await prisma.contact.create({
      data: {
        empresa: `Empresa Filtro ${sufixo}`,
        email: `filtro-${sufixo}@example.com`,
        status: ContactStatus.Ativo,
        groups: { connect: { id: group.id } },
        tags: { connect: { id: tag.id } },
      },
    });

    const byGroup = await prisma.contact.findMany({
      where: { groups: { some: { id: group.id } } },
    });
    const byTag = await prisma.contact.findMany({
      where: { tags: { some: { id: tag.id } } },
    });

    expect(byGroup.map((item) => item.id)).toContain(contact.id);
    expect(byTag.map((item) => item.id)).toContain(contact.id);
  });

  it("busca combinada por status e termo retorna conjunto esperado", async () => {
    const sufixo = Date.now();
    await prisma.contact.create({
      data: {
        empresa: `Busca Alfa ${sufixo}`,
        telefone: "11988887777",
        status: ContactStatus.Ativo,
      },
    });
    await prisma.contact.create({
      data: {
        empresa: `Busca Beta ${sufixo}`,
        telefone: "11977776666",
        status: ContactStatus.Inativo,
      },
    });

    const results = await prisma.contact.findMany({
      where: {
        status: ContactStatus.Ativo,
        OR: [
          { empresa: { contains: "Alfa", mode: "insensitive" } },
          { telefone: { contains: "8888", mode: "insensitive" } },
        ],
      },
    });

    expect(results.some((item) => item.empresa.includes("Alfa"))).toBe(true);
    expect(results.every((item) => item.status === ContactStatus.Ativo)).toBe(
      true,
    );
  });
});
