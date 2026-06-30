import { beforeEach, describe, expect, it, vi } from "vitest";

const createAuditLogMock = vi.fn();

vi.mock("@/repositories/audit-log", () => ({
  createAuditLog: (...args: unknown[]) => createAuditLogMock(...args),
}));

import { auditLog } from "@/services/audit-log";

describe("auditLog helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createAuditLogMock.mockResolvedValue({ id: "log-1" });
  });

  it("registra AuditLog com ator, ação e entidade", async () => {
    await auditLog({
      actorId: "user-1",
      action: "contact.deleted",
      entity: "Contact",
      entityId: "contact-1",
      payload: { empresa: "ACME" },
    });

    expect(createAuditLogMock).toHaveBeenCalledWith({
      actorId: "user-1",
      action: "contact.deleted",
      entity: "Contact",
      entityId: "contact-1",
      payload: { empresa: "ACME" },
    });
  });

  it("sanitiza credenciais e segredos do payload", async () => {
    await auditLog({
      actorId: "user-1",
      action: "emailProvider.updated",
      entity: "EmailProvider",
      entityId: "provider-1",
      payload: {
        name: "SMTP",
        credentials: { apiKey: "secret-key" },
        password: "plain-text",
      },
    });

    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          name: "SMTP",
          credentials: "[redacted]",
          password: "[redacted]",
        },
      }),
    );
  });
});
