// Cliente Prisma singleton (Prisma v7 com driver adapter para PostgreSQL).
// Reutiliza a instância em dev (hot reload) para evitar esgotar conexões.
// Importado apenas no servidor — nunca exponha este módulo a Client Components.
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
