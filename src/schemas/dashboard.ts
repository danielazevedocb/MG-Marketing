// Schemas Zod do módulo de dashboard.
import { z } from "zod";

export const dashboardTimeSeriesSchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(14),
});

export type DashboardTimeSeriesInput = z.infer<typeof dashboardTimeSeriesSchema>;
