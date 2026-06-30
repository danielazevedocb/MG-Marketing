import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
const historyServiceMock = {
  listSendHistory: vi.fn(),
  listAuditLogs: vi.fn(),
  exportSendHistoryCsv: vi.fn(),
  exportAuditLogsCsv: vi.fn(),
  getFilterOptions: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/services/history", () => ({
  getHistoryService: () => historyServiceMock,
}));

import {
  exportAuditLogsCsvAction,
  listAuditLogsAction,
  listSendHistoryAction,
} from "@/actions/history";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

describe("RBAC das actions de histórico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    historyServiceMock.listSendHistory.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    historyServiceMock.listAuditLogs.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
  });

  it("Marketing pode listar histórico de envios", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));

    const result = await listSendHistoryAction({ page: 1, pageSize: 20 });

    expect(result.success).toBe(true);
    expect(historyServiceMock.listSendHistory).toHaveBeenCalledOnce();
  });

  it("Marketing não pode acessar auditoria (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Marketing));

    const result = await listAuditLogsAction({ page: 1, pageSize: 20 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(historyServiceMock.listAuditLogs).not.toHaveBeenCalled();
  });

  it("Visualizador não pode exportar auditoria (403)", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Visualizador));

    const result = await exportAuditLogsCsvAction({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
    expect(historyServiceMock.exportAuditLogsCsv).not.toHaveBeenCalled();
  });

  it("Administrador pode acessar auditoria", async () => {
    authMock.mockResolvedValue(sessionFor(Role.Administrador));

    const result = await listAuditLogsAction({ page: 1, pageSize: 20 });

    expect(result.success).toBe(true);
    expect(historyServiceMock.listAuditLogs).toHaveBeenCalledOnce();
  });
});
