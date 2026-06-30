import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const CLIENT_COMPONENT_PATH = resolve(
  process.cwd(),
  "src/components/forms/file-dropzone.tsx",
);

const FORBIDDEN_IMPORTS = [
  "@/lib/r2-client",
  "@/lib/r2-env",
  "@/services/storage",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ACCOUNT_ID",
];

describe("segurança do bundle de cliente (file-dropzone)", () => {
  it("componente de upload não importa módulos R2 nem referencia credenciais", () => {
    const source = readFileSync(CLIENT_COMPONENT_PATH, "utf8");

    for (const forbidden of FORBIDDEN_IMPORTS) {
      expect(source).not.toContain(forbidden);
    }

    expect(source).toContain('"use client"');
    expect(source).toContain("@/actions/file-upload");
  });
});
