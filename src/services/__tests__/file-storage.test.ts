import { beforeEach, describe, expect, it, vi } from "vitest";

import { FileAssetType } from "@/generated/prisma/enums";

const createFileAssetMock = vi.fn();
const deleteFileAssetMock = vi.fn();
const findFileAssetByIdMock = vi.fn();

vi.mock("@/repositories/file-asset", () => ({
  createFileAsset: (...args: unknown[]) => createFileAssetMock(...args),
  deleteFileAsset: (...args: unknown[]) => deleteFileAssetMock(...args),
  findFileAssetById: (...args: unknown[]) => findFileAssetByIdMock(...args),
}));

vi.mock("@/utils/image-optimization", () => ({
  isOptimizableImage: (mime: string) => mime.startsWith("image/"),
  optimizeImage: vi.fn(async (buffer: Buffer, mimeType: string) => ({
    buffer,
    mimeType,
    width: 800,
    height: 600,
    size: buffer.byteLength,
  })),
}));

import { FileStorageService } from "@/services/file-storage";
import type { R2StorageService } from "@/services/storage";

function createMockStorage(): R2StorageService {
  return {
    upload: vi.fn(async (input) => ({
      key: "uploads/test.png",
      url: "https://cdn.example.com/uploads/test.png",
      size: input.body.byteLength,
      contentType: input.contentType,
    })),
    removeByUrl: vi.fn(async () => undefined),
  } as unknown as R2StorageService;
}

describe("FileStorageService", () => {
  let storage: R2StorageService;
  let service: FileStorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = createMockStorage();
    service = new FileStorageService({ storage });
  });

  it("uploadAndPersist persiste somente URL e metadados (sem binário)", async () => {
    createFileAssetMock.mockResolvedValue({
      id: "asset-1",
      url: "https://cdn.example.com/uploads/test.png",
      type: FileAssetType.imagem,
      filename: "foto.png",
      mimeType: "image/png",
      size: 42,
      width: 800,
      height: 600,
      uploadedById: "user-1",
    });

    // Assinatura PNG real (magic bytes) — a validação de conteúdo do arquivo
    // rejeita buffers que não batem com o `mimeType` declarado.
    const buffer = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from("fake-image-body"),
    ]);
    const result = await service.uploadAndPersist({
      buffer,
      originalName: "foto.png",
      mimeType: "image/png",
      type: FileAssetType.imagem,
      uploadedById: "user-1",
    });

    expect(storage.upload).toHaveBeenCalledOnce();
    expect(createFileAssetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://cdn.example.com/uploads/test.png",
        type: FileAssetType.imagem,
        filename: "foto.png",
        mimeType: "image/png",
        uploadedById: "user-1",
      }),
    );
    expect(createFileAssetMock.mock.calls[0]?.[0]).not.toHaveProperty("buffer");
    expect(createFileAssetMock.mock.calls[0]?.[0]).not.toHaveProperty("data");
    expect(result.fileAsset.url).toBe(
      "https://cdn.example.com/uploads/test.png",
    );
  });

  it("rejeita arquivo cujo conteúdo não corresponde ao mimeType declarado", async () => {
    const buffer = Buffer.from("isto nao e um png de verdade");

    await expect(
      service.uploadAndPersist({
        buffer,
        originalName: "foto.png",
        mimeType: "image/png",
        type: FileAssetType.imagem,
        uploadedById: "user-1",
      }),
    ).rejects.toThrow(/não corresponde ao tipo declarado/);

    expect(storage.upload).not.toHaveBeenCalled();
    expect(createFileAssetMock).not.toHaveBeenCalled();
  });

  it("removeFileAsset remove objeto do R2 e registro do banco", async () => {
    findFileAssetByIdMock.mockResolvedValue({
      id: "asset-1",
      url: "https://cdn.example.com/uploads/test.png",
    });
    deleteFileAssetMock.mockResolvedValue({ id: "asset-1" });

    await service.removeFileAsset("asset-1");

    expect(storage.removeByUrl).toHaveBeenCalledWith(
      "https://cdn.example.com/uploads/test.png",
    );
    expect(deleteFileAssetMock).toHaveBeenCalledWith("asset-1");
  });
});
