import { describe, expect, it } from "vitest";

import {
  extractYouTubeVideoId,
  httpUrlSchema,
  isHttpUrl,
  optionalHttpUrlSchema,
} from "@/schemas/url";

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

describe("extractYouTubeVideoId", () => {
  it("extrai o ID de watch?v=", () => {
    expect(
      extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extrai o ID de youtu.be", () => {
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("extrai o ID de /embed/", () => {
    expect(
      extractYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extrai o ID de /shorts/", () => {
    expect(
      extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("rejeita host que não é do YouTube", () => {
    expect(
      extractYouTubeVideoId("https://naoehyoutube.com/watch?v=dQw4w9WgXcQ"),
    ).toBeNull();
    expect(extractYouTubeVideoId("https://vimeo.com/123456")).toBeNull();
  });

  it("rejeita esquema perigoso", () => {
    expect(extractYouTubeVideoId("javascript:alert(1)")).toBeNull();
  });

  it("rejeita ID malformado", () => {
    expect(
      extractYouTubeVideoId("https://www.youtube.com/watch?v=abc"),
    ).toBeNull();
  });

  it("rejeita string que não é URL", () => {
    expect(extractYouTubeVideoId("não é url")).toBeNull();
  });
});
