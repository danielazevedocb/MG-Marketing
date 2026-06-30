import { describe, expect, it } from "vitest";

import { parseFutureScheduledAt } from "@/schemas/campaign";

describe("parseFutureScheduledAt", () => {
  it("aceita data futura em UTC", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const result = parseFutureScheduledAt(future);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.date.toISOString()).toBe(future);
    }
  });

  it("rejeita data no passado", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const result = parseFutureScheduledAt(past);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("futuro");
    }
  });
});
