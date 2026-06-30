import { beforeEach, describe, expect, it, vi } from "vitest";
import type { R2Config } from "@/lib/r2-env";
import {
  buildPublicUrl,
  createR2Client,
  deleteObject,
  extractKeyFromPublicUrl,
  putObject,
  type R2ClientDeps,
} from "@/lib/r2-client";
import { R2StorageService } from "@/services/storage";

const mockConfig: R2Config = {
  accountId: "test-account",
  accessKeyId: "test-key",
  secretAccessKey: "test-secret",
  bucketName: "test-bucket",
  publicUrl: "https://cdn.example.com",
};

function createMockDeps(): R2ClientDeps & {
  send: ReturnType<typeof vi.fn>;
} {
  const send = vi.fn().mockResolvedValue({});
  const client = { send } as unknown as R2ClientDeps["client"];
  return { config: mockConfig, client, send };
}

describe("R2StorageService", () => {
  let deps: ReturnType<typeof createMockDeps>;
  let service: R2StorageService;

  beforeEach(() => {
    deps = createMockDeps();
    service = new R2StorageService({ r2: deps });
  });

  it("upload retorna URL pública após PutObject", async () => {
    const body = Buffer.from("conteudo-teste");

    const result = await service.upload({
      key: "",
      body,
      contentType: "image/png",
      originalName: "banner.png",
    });

    expect(deps.send).toHaveBeenCalledOnce();
    expect(result.url).toMatch(/^https:\/\/cdn\.example\.com\/uploads\//);
    expect(result.contentType).toBe("image/png");
    expect(result.size).toBe(body.byteLength);
  });

  it("removeByUrl envia DeleteObject com a chave correta", async () => {
    const url = "https://cdn.example.com/uploads/2026/06/id-file.png";

    await service.removeByUrl(url);

    expect(deps.send).toHaveBeenCalledOnce();
    const command = deps.send.mock.calls[0]?.[0];
    expect(command.input.Key).toBe("uploads/2026/06/id-file.png");
    expect(command.input.Bucket).toBe("test-bucket");
  });
});

describe("r2-client helpers", () => {
  it("buildPublicUrl monta URL a partir da chave", () => {
    expect(buildPublicUrl(mockConfig, "uploads/a.png")).toBe(
      "https://cdn.example.com/uploads/a.png",
    );
  });

  it("extractKeyFromPublicUrl extrai chave válida", () => {
    expect(
      extractKeyFromPublicUrl(
        mockConfig,
        "https://cdn.example.com/uploads/x.pdf",
      ),
    ).toBe("uploads/x.pdf");
    expect(extractKeyFromPublicUrl(mockConfig, "https://outro.com/x.pdf")).toBe(
      null,
    );
  });

  it("createR2Client instancia cliente S3-compatible", () => {
    const client = createR2Client(mockConfig);
    expect(client).toBeDefined();
  });

  it("putObject e deleteObject delegam ao client.send", async () => {
    const deps = createMockDeps();
    await putObject(deps, {
      key: "k",
      body: Buffer.from("x"),
      contentType: "text/plain",
    });
    await deleteObject(deps, "k");
    expect(deps.send).toHaveBeenCalledTimes(2);
  });
});
