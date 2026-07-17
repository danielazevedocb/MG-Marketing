import { describe, expect, it } from "vitest";

import { httpUrlSchema, isHttpUrl, optionalHttpUrlSchema } from "@/schemas/url";

describe("isHttpUrl", () => {
  it("aceita http e https", () => {
    expect(isHttpUrl("https://exemplo.com")).toBe(true);
    expect(isHttpUrl("http://exemplo.com/pagina")).toBe(true);
  });

  it("rejeita esquemas perigosos", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isHttpUrl("vbscript:msgbox(1)")).toBe(false);
  });

  it("rejeita string que não é URL", () => {
    expect(isHttpUrl("não é url")).toBe(false);
  });
});

describe("httpUrlSchema", () => {
  it("aceita URL http/https válida", () => {
    const result = httpUrlSchema().safeParse("https://exemplo.com/oferta");
    expect(result.success).toBe(true);
  });

  it("rejeita javascript: mesmo sendo uma URL sintaticamente válida", () => {
    const result = httpUrlSchema().safeParse("javascript:alert(1)");
    expect(result.success).toBe(false);
  });
});

describe("optionalHttpUrlSchema", () => {
  it("aceita string vazia", () => {
    expect(optionalHttpUrlSchema().safeParse("").success).toBe(true);
  });

  it("rejeita data: quando preenchido", () => {
    expect(optionalHttpUrlSchema().safeParse("data:text/html,x").success).toBe(
      false,
    );
  });
});
