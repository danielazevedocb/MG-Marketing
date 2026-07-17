// @vitest-environment node
//
// Route Handlers rodam no runtime Node/Edge, não no browser — usar o
// ambiente "node" aqui (em vez do jsdom padrão do projeto) evita um
// conflito de identidade entre o `File` do jsdom e o `File`/`FormData`
// nativos do Node (undici) usados por `Request.formData()`.
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FileAssetType, Role } from "@/generated/prisma/enums";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth-errors";
import { FileValidationError, StorageOperationError } from "@/lib/file-errors";

const requirePermissionMock = vi.fn();
const uploadAndPersistMock = vi.fn();

vi.mock("@/services/auth", () => ({
  requirePermission: (...args: unknown[]) => requirePermissionMock(...args),
}));

vi.mock("@/services/file-storage", () => ({
  getFileStorageService: () => ({
    uploadAndPersist: (...args: unknown[]) => uploadAndPersistMock(...args),
  }),
}));

import { POST } from "@/app/api/files/upload/route";

function formDataWithFile(options?: {
  omitFile?: boolean;
  type?: string;
  filename?: string;
  mimeType?: string;
}): FormData {
  const formData = new FormData();
  if (!options?.omitFile) {
    const file = new File(["conteudo"], options?.filename ?? "logo.png", {
      type: options?.mimeType ?? "image/png",
    });
    formData.set("file", file);
  }
  formData.set("type", options?.type ?? FileAssetType.imagem);
  return formData;
}

function requestWithFormData(formData: FormData): Request {
  return new Request("https://example.com/api/files/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/files/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermissionMock.mockResolvedValue({
      id: "user-1",
      role: Role.Marketing,
    });
  });

  it("rejeita sem sessão autenticada (401)", async () => {
    requirePermissionMock.mockRejectedValue(new UnauthorizedError());

    const response = await POST(requestWithFormData(formDataWithFile()));

    expect(response.status).toBe(401);
    expect(uploadAndPersistMock).not.toHaveBeenCalled();
  });

  it("rejeita usuário sem permissão files:write (403)", async () => {
    requirePermissionMock.mockRejectedValue(new ForbiddenError());

    const response = await POST(requestWithFormData(formDataWithFile()));

    expect(response.status).toBe(403);
    expect(uploadAndPersistMock).not.toHaveBeenCalled();
  });

  it("retorna 400 quando nenhum arquivo é enviado", async () => {
    const response = await POST(
      requestWithFormData(formDataWithFile({ omitFile: true })),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/nenhum arquivo/i);
    expect(uploadAndPersistMock).not.toHaveBeenCalled();
  });

  it("retorna 400 quando o tipo de arquivo é inválido", async () => {
    const response = await POST(
      requestWithFormData(formDataWithFile({ type: "tipo-invalido" })),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/tipo de arquivo inválido/i);
    expect(uploadAndPersistMock).not.toHaveBeenCalled();
  });

  it("faz upload com sucesso e retorna o fileAsset (200)", async () => {
    uploadAndPersistMock.mockResolvedValue({
      fileAsset: {
        id: "asset-1",
        url: "https://cdn.example.com/logo.png",
        type: FileAssetType.imagem,
        filename: "logo.png",
        mimeType: "image/png",
        size: 8,
        width: null,
        height: null,
      },
    });

    const response = await POST(requestWithFormData(formDataWithFile()));

    expect(response.status).toBe(200);
    expect(uploadAndPersistMock).toHaveBeenCalledWith(
      expect.objectContaining({
        originalName: "logo.png",
        mimeType: "image/png",
        type: FileAssetType.imagem,
        uploadedById: "user-1",
      }),
    );
    const body = await response.json();
    expect(body.fileAsset.url).toBe("https://cdn.example.com/logo.png");
  });

  it("propaga erro de validação de arquivo como 400", async () => {
    uploadAndPersistMock.mockRejectedValue(
      new FileValidationError("Arquivo excede o limite de 10 MB"),
    );

    const response = await POST(requestWithFormData(formDataWithFile()));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Arquivo excede o limite de 10 MB");
  });

  it("propaga erro de storage como 500 sem vazar detalhes internos", async () => {
    uploadAndPersistMock.mockRejectedValue(
      new StorageOperationError("bucket indisponível"),
    );

    const response = await POST(requestWithFormData(formDataWithFile()));

    expect(response.status).toBe(500);
  });
});
