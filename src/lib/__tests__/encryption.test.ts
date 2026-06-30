import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { decrypt, encrypt } from "@/lib/encryption";

describe("encryption service", () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  afterEach(() => {
    process.env.ENCRYPTION_KEY = originalKey;
  });

  it("cifra e decifra corretamente", () => {
    const plaintext = "senha-secreta-smtp";
    const ciphertext = encrypt(plaintext);

    expect(ciphertext).not.toBe(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  it("produz valores cifrados diferentes a cada chamada", () => {
    const first = encrypt("mesmo-texto");
    const second = encrypt("mesmo-texto");

    expect(first).not.toBe(second);
    expect(decrypt(first)).toBe("mesmo-texto");
    expect(decrypt(second)).toBe("mesmo-texto");
  });

  it("rejeita chave ausente ou inválida", () => {
    process.env.ENCRYPTION_KEY = "";
    expect(() => encrypt("teste")).toThrow(/ENCRYPTION_KEY/);

    process.env.ENCRYPTION_KEY = Buffer.alloc(16).toString("base64");
    expect(() => encrypt("teste")).toThrow(/inválida/);
  });
});
