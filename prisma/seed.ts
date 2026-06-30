// Seed idempotente do MG Marketing.
// Popula dados iniciais (usuário Administrador, grupos e tags de exemplo) usando `upsert`,
// de modo que executar mais de uma vez NÃO duplica registros nem gera erro.
//
// Execução: `npx prisma db seed` (configurado em `prisma.config.ts` → `tsx prisma/seed.ts`).
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

/// Cliente Prisma usado pelo seed (driver adapter PostgreSQL — Prisma v7).
type SeedClient = Pick<PrismaClient, "user" | "group" | "tag" | "template">;

// Email do administrador inicial (sobrescrevível por env em ambientes reais).
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@mgmarketing.local";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Administrador MG";

const SAMPLE_GROUPS = [
  { nome: "Clientes", descricao: "Contatos de clientes ativos" },
  { nome: "Leads", descricao: "Potenciais clientes em prospecção" },
  { nome: "Fornecedores", descricao: "Parceiros e fornecedores" },
] as const;

const SAMPLE_TAGS = [
  { nome: "VIP", cor: "#f59e0b" },
  { nome: "Newsletter", cor: "#3b82f6" },
  { nome: "Promoções", cor: "#10b981" },
] as const;

/**
 * Aplica o seed de forma idempotente.
 * Recebe o cliente por injeção para permitir testes (mock) sem acoplar à instância real.
 */
export async function seed(prisma: SeedClient): Promise<void> {
  // Usuário Administrador (idempotente por email único).
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, role: "Administrador" },
    create: { email: ADMIN_EMAIL, name: ADMIN_NAME, role: "Administrador" },
  });

  // Grupos de exemplo (idempotentes por `nome` único).
  for (const group of SAMPLE_GROUPS) {
    await prisma.group.upsert({
      where: { nome: group.nome },
      update: { descricao: group.descricao },
      create: { nome: group.nome, descricao: group.descricao },
    });
  }

  // Tags de exemplo (idempotentes por `nome` único).
  for (const tag of SAMPLE_TAGS) {
    await prisma.tag.upsert({
      where: { nome: tag.nome },
      update: { cor: tag.cor },
      create: { nome: tag.nome, cor: tag.cor },
    });
  }
}

async function main(): Promise<void> {
  const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await seed(prisma);
    console.log("Seed concluído com sucesso (idempotente).");
  } finally {
    await prisma.$disconnect();
  }
}

// Executa apenas quando chamado diretamente (não durante import em testes).
const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === `file://${process.argv[1]}`;

if (isDirectRun) {
  main().catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exit(1);
  });
}
