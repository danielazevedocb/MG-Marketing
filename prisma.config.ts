// Configuração central do Prisma CLI (Prisma v7).
// As URLs do banco saem das variáveis de ambiente do servidor — nunca de NEXT_PUBLIC_*.
// Em dev, carregamos `.env.local` (padrão do Next.js) e, como fallback, `.env`.
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

import { defineConfig } from "prisma/config";

// Placeholder usado apenas quando nenhum banco real está configurado, para permitir
// `prisma validate`/`generate`/`migrate diff` offline. Comandos que conectam ao banco
// (migrate dev/deploy, db seed) exigem um DATABASE_URL real em `.env.local`.
const PLACEHOLDER_DB_URL =
  "postgresql://user:password@localhost:5432/postgres?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // O CLI (migrations) usa conexão DIRETA (DIRECT_URL, porta 5432 no Supabase).
    // O runtime da aplicação usa o pool (DATABASE_URL) via driver adapter em `src/lib/prisma.ts`.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? PLACEHOLDER_DB_URL,
  },
});
