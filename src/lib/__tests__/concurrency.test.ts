import { describe, expect, it } from "vitest";

import { mapWithConcurrencyLimit } from "@/lib/concurrency";

describe("mapWithConcurrencyLimit", () => {
  it("processa todos os itens e preserva a ordem dos resultados", async () => {
    const items = Array.from({ length: 10 }, (_, index) => index);

    const results = await mapWithConcurrencyLimit(items, 3, async (item) => {
      await new Promise((resolve) => setTimeout(resolve, (10 - item) % 4));
      return item * 2;
    });

    expect(results).toEqual(items.map((item) => item * 2));
  });

  it("nunca excede o limite de execuções simultâneas", async () => {
    const items = Array.from({ length: 12 }, (_, index) => index);
    let active = 0;
    let maxActive = 0;

    await mapWithConcurrencyLimit(items, 4, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return item;
    });

    expect(maxActive).toBeLessThanOrEqual(4);
  });

  it("isola falhas por item sem interromper os demais quando aguardado individualmente", async () => {
    const items = [1, 2, 3, 4];

    const results = await mapWithConcurrencyLimit(items, 2, async (item) => {
      if (item === 2) {
        return { ok: false, item };
      }
      return { ok: true, item };
    });

    expect(results).toEqual([
      { ok: true, item: 1 },
      { ok: false, item: 2 },
      { ok: true, item: 3 },
      { ok: true, item: 4 },
    ]);
  });

  it("lida com lista vazia sem erro", async () => {
    const results = await mapWithConcurrencyLimit(
      [] as number[],
      5,
      async (item) => item,
    );

    expect(results).toEqual([]);
  });
});
