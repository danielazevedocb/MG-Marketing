// Utilitário de testes de integração do Prisma.
//
// Os testes de integração (aplicar migrations, relações, constraints) exigem um banco
// PostgreSQL real e DEDICADO a testes. Para evitar falhas em ambientes sem banco, eles só
// rodam quando `DATABASE_URL_TEST` está definido — caso contrário são pulados (skip).
//
// Como habilitar localmente:
//   1. Suba um Postgres de teste (ex.: container) e crie um schema/banco isolado.
//   2. Exporte `DATABASE_URL_TEST="postgresql://.../postgres_test?schema=public"`.
//   3. Rode `npm test` — as migrations são aplicadas automaticamente antes da suíte.
import { execSync } from "node:child_process";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

export const TEST_DB_URL = process.env.DATABASE_URL_TEST;
export const hasTestDb = Boolean(TEST_DB_URL);

/** Cria um PrismaClient apontando para o banco de teste. */
export function createTestPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: TEST_DB_URL });
  return new PrismaClient({ adapter });
}

/** Aplica as migrations versionadas no banco de teste (idempotente via migrate deploy). */
export function deployMigrations(): void {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DB_URL, DIRECT_URL: TEST_DB_URL },
  });
}
