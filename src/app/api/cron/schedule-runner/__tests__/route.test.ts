import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runDueCampaignsMock = vi.fn();

vi.mock("@/services/schedule-runner", () => ({
  getScheduleRunnerService: () => ({
    runDueCampaigns: (...args: unknown[]) => runDueCampaignsMock(...args),
  }),
}));

import { GET, POST } from "@/app/api/cron/schedule-runner/route";

const originalCronSecret = process.env.CRON_SECRET;

function requestWithAuth(authorization?: string): Request {
  return new Request("https://example.com/api/cron/schedule-runner", {
    headers: authorization ? { authorization } : undefined,
  });
}

describe("GET/POST /api/cron/schedule-runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "segredo-de-teste";
    runDueCampaignsMock.mockResolvedValue({
      processed: 0,
      dispatched: 0,
      skipped: 0,
      failed: 0,
      items: [],
    });
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  it("rejeita sem header Authorization", async () => {
    const response = await GET(requestWithAuth());

    expect(response.status).toBe(401);
    expect(runDueCampaignsMock).not.toHaveBeenCalled();
  });

  it("rejeita com Bearer token incorreto", async () => {
    const response = await GET(requestWithAuth("Bearer token-errado"));

    expect(response.status).toBe(401);
    expect(runDueCampaignsMock).not.toHaveBeenCalled();
  });

  it("falha fechado quando CRON_SECRET não está configurado no servidor", async () => {
    process.env.CRON_SECRET = "";

    const response = await GET(requestWithAuth("Bearer qualquer-coisa"));

    expect(response.status).toBe(401);
    expect(runDueCampaignsMock).not.toHaveBeenCalled();
  });

  it("executa o runner com Bearer token correto (GET)", async () => {
    const response = await GET(requestWithAuth("Bearer segredo-de-teste"));

    expect(response.status).toBe(200);
    expect(runDueCampaignsMock).toHaveBeenCalledOnce();
    const body = await response.json();
    expect(body).toEqual({
      processed: 0,
      dispatched: 0,
      skipped: 0,
      failed: 0,
      items: [],
    });
  });

  it("executa o runner com Bearer token correto (POST)", async () => {
    const response = await POST(requestWithAuth("Bearer segredo-de-teste"));

    expect(response.status).toBe(200);
    expect(runDueCampaignsMock).toHaveBeenCalledOnce();
  });
});
