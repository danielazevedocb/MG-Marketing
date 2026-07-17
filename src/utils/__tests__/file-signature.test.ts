import { describe, expect, it } from "vitest";

import { matchesDeclaredMimeType } from "@/utils/file-signature";

const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_BYTES = [0xff, 0xd8, 0xff, 0xe0];

describe("matchesDeclaredMimeType", () => {
  it("aceita PNG com magic bytes corretos", () => {
    const buffer = Buffer.from([...PNG_BYTES, 1, 2, 3]);
    expect(matchesDeclaredMimeType(buffer, "image/png")).toBe(true);
  });

  it("rejeita buffer que declara PNG mas não tem a assinatura", () => {
    const buffer = Buffer.from("não é uma imagem");
    expect(matchesDeclaredMimeType(buffer, "image/png")).toBe(false);
  });

  it("aceita JPEG com magic bytes corretos", () => {
    const buffer = Buffer.from(JPEG_BYTES);
    expect(matchesDeclaredMimeType(buffer, "image/jpeg")).toBe(true);
  });

  it("rejeita JPEG declarado com conteúdo de outro tipo (PNG)", () => {
    const buffer = Buffer.from(PNG_BYTES);
    expect(matchesDeclaredMimeType(buffer, "image/jpeg")).toBe(false);
  });

  it("aceita PDF com assinatura %PDF-", () => {
    const buffer = Buffer.from("%PDF-1.7 resto do arquivo");
    expect(matchesDeclaredMimeType(buffer, "application/pdf")).toBe(true);
  });

  it("rejeita PDF sem a assinatura correta", () => {
    const buffer = Buffer.from("nao e um pdf");
    expect(matchesDeclaredMimeType(buffer, "application/pdf")).toBe(false);
  });

  it("aceita docx/xlsx pela assinatura de container ZIP", () => {
    const buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]);
    expect(
      matchesDeclaredMimeType(
        buffer,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(true);
    expect(
      matchesDeclaredMimeType(
        buffer,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ),
    ).toBe(true);
  });

  it("não bloqueia tipos sem assinatura binária conhecida (text/plain)", () => {
    const buffer = Buffer.from("qualquer conteúdo de texto");
    expect(matchesDeclaredMimeType(buffer, "text/plain")).toBe(true);
  });
});
