// Testes de INTEGRAÇÃO do Prisma (exigem banco PostgreSQL de teste).
// Só rodam quando `DATABASE_URL_TEST` está definido; caso contrário são pulados.
// Cobrem: aplicar migrations, relações N:N, constraints @unique e default de status.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";

import { createTestPrisma, deployMigrations, hasTestDb } from "./test-db";

const suite = hasTestDb ? describe : describe.skip;

suite("integração Prisma (banco de teste)", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    deployMigrations();
    prisma = createTestPrisma();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
  });

  it("aplica migrations e expõe tabelas/enums esperados", async () => {
    const tabelas = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    );
    const nomes = tabelas.map((t) => t.table_name);
    expect(nomes).toContain("User");
    expect(nomes).toContain("Campaign");
    expect(nomes).toContain("_ContactGroups");
  });

  it("relação N:N: Contact associado a Group e Tag consultável nos dois sentidos", async () => {
    const sufixo = Date.now();
    const contact = await prisma.contact.create({
      data: {
        empresa: `Empresa ${sufixo}`,
        email: `rel-${sufixo}@example.com`,
        groups: { create: { nome: `Grupo ${sufixo}` } },
        tags: { create: { nome: `Tag ${sufixo}` } },
      },
      include: { groups: true, tags: true },
    });

    expect(contact.groups).toHaveLength(1);
    expect(contact.tags).toHaveLength(1);

    const grupoComContatos = await prisma.group.findUnique({
      where: { id: contact.groups[0].id },
      include: { contacts: true },
    });
    expect(grupoComContatos?.contacts.map((c) => c.id)).toContain(contact.id);
  });

  it("constraint @unique: email duplicado de User é rejeitado", async () => {
    const email = `dup-${Date.now()}@example.com`;
    await prisma.user.create({ data: { email } });
    await expect(prisma.user.create({ data: { email } })).rejects.toThrow();
  });

  it("Campaign sem status explícito assume 'draft'", async () => {
    const campaign = await prisma.campaign.create({
      data: { nome: `Campanha ${Date.now()}` },
    });
    expect(campaign.status).toBe("draft");
  });
});
