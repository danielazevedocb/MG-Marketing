import { z } from "zod";

export const globalSearchSchema = z.object({
  query: z.string().trim().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type GlobalSearchInput = z.infer<typeof globalSearchSchema>;
