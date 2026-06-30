import { describe, expect, it } from "vitest";

import { FileAssetType } from "@/generated/prisma/enums";
import {
  FILE_SIZE_LIMITS,
  getMaxFileSizeForAssetType,
  validateFileMetadata,
} from "@/schemas/file-upload";

describe("validação de upload de arquivos", () => {
  it("aceita imagem válida dentro do limite", () => {
    const result = validateFileMetadata({
      type: FileAssetType.banner,
      originalName: "banner.png",
      mimeType: "image/png",
      size: 1024,
    });

    expect(result.mimeType).toBe("image/png");
  });

  it("rejeita MIME não permitido para o tipo", () => {
    expect(() =>
      validateFileMetadata({
        type: FileAssetType.pdf,
        originalName: "doc.exe",
        mimeType: "application/x-msdownload",
        size: 1024,
      }),
    ).toThrow(/não permitido/);
  });

  it("rejeita arquivo acima do limite de tamanho", () => {
    const max = getMaxFileSizeForAssetType(FileAssetType.imagem);
    expect(() =>
      validateFileMetadata({
        type: FileAssetType.imagem,
        originalName: "grande.png",
        mimeType: "image/png",
        size: max + 1,
      }),
    ).toThrow(/limite/);
  });

  it("aplica limites distintos por tipo", () => {
    expect(getMaxFileSizeForAssetType(FileAssetType.imagem)).toBe(
      FILE_SIZE_LIMITS.image,
    );
    expect(getMaxFileSizeForAssetType(FileAssetType.pdf)).toBe(
      FILE_SIZE_LIMITS.pdf,
    );
    expect(getMaxFileSizeForAssetType(FileAssetType.arquivo)).toBe(
      FILE_SIZE_LIMITS.generic,
    );
  });
});
