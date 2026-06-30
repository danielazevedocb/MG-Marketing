import { describe, expect, it } from "vitest";

// Smoke test: valida que o runner de testes está operacional.
describe("ambiente de testes", () => {
  it("executa uma asserção trivial", () => {
    expect(1 + 1).toBe(2);
  });
});
