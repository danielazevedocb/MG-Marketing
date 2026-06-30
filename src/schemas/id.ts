// Validação de IDs Prisma (`String @id`) — CUID, UUID ou IDs legados (ex.: seed).
import { z } from "zod";

export function entityIdSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} inválido`)
    .max(191, `${label} inválido`);
}

export function entityIdArraySchema(label: string) {
  return z.array(entityIdSchema(label));
}
