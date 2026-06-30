import { describe, expect, it } from "vitest";

import { ErpMgImporter } from "@/services/contact-import/erp-mg-importer";

describe("ErpMgImporter (placeholder)", () => {
  it("não quebra o fluxo e sinaliza integração futura", async () => {
    const importer = new ErpMgImporter();
    const result = await importer.import();

    expect(result.placeholder).toBe(true);
    expect(result.imported).toBe(0);
    expect(result.message).toContain("ERP MG");
  });
});
