import { describe, expect, it } from "vitest";

import {
  formatDateBr,
  formatDateTimeBr,
  parseDateOnly,
  parseIsoDateTime,
  setTimeOnDate,
  toDateOnlyString,
} from "@/lib/date-format";

describe("date-format", () => {
  it("formata data no padrão brasileiro", () => {
    const date = new Date(2026, 6, 2, 14, 30);

    expect(formatDateBr(date)).toBe("02/07/2026");
    expect(formatDateTimeBr(date)).toBe("02/07/2026 14:30");
  });

  it("converte entre ISO date-only e Date", () => {
    const date = new Date(2026, 6, 2);

    expect(toDateOnlyString(date)).toBe("2026-07-02");
    expect(parseDateOnly("2026-07-02")?.getDate()).toBe(2);
    expect(parseDateOnly("2026-07-02")?.getMonth()).toBe(6);
  });

  it("combina data e hora no fuso local", () => {
    const date = new Date(2026, 6, 2);
    const combined = setTimeOnDate(date, 14, 0);

    expect(combined.getHours()).toBe(14);
    expect(combined.getMinutes()).toBe(0);
    expect(parseIsoDateTime(combined.toISOString())?.getHours()).toBe(14);
  });
});
