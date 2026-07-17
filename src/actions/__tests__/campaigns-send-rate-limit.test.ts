import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
const checkRateLimitMock = vi.fn();
const dispatchCampaignMock = vi.fn();
const resendCampaignMock = vi.fn();
const deleteCampaignMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock("@/services/channel-dispatch", () => ({
  getChannelDispatchService: () => ({
    dispatchCampaign: (...args: unknown[]) => dispatchCampaignMock(...args),
  }),
}));

vi.mock("@/services/campaigns", () => ({
  getCampaignService: () => ({
    resendCampaign: (...args: unknown[]) => resendCampaignMock(...args),
    deleteCampaign: (...args: unknown[]) => deleteCampaignMock(...args),
  }),
}));

import { resendCampaignAction, sendCampaignAction } from "@/actions/campaigns";

function sessionFor(role: Role) {
  return {
    user: { id: "user-1", email: "user@mg.com", name: "User", role },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

describe("rate limit no envio de campanhas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue(sessionFor(Role.Marketing));
  });

  it("bloqueia sendCampaignAction quando o limite foi excedido, sem chamar o dispatch", async () => {
    checkRateLimitMock.mockReturnValue({ allowed: false, retryAfterMs: 5000 });

    const result = await sendCampaignAction("campaign-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/muitos envios/i);
    }
    expect(checkRateLimitMock).toHaveBeenCalledWith("campaign-send:user-1");
    expect(dispatchCampaignMock).not.toHaveBeenCalled();
  });

  it("permite sendCampaignAction quando dentro do limite", async () => {
    checkRateLimitMock.mockReturnValue({ allowed: true });
    dispatchCampaignMock.mockResolvedValue({
      campaignId: "campaign-1",
      items: [],
      summary: { total: 0, success: 0, failure: 0 },
    });

    const result = await sendCampaignAction("campaign-1");

    expect(result.success).toBe(true);
    expect(dispatchCampaignMock).toHaveBeenCalledWith("campaign-1", "user-1");
  });

  it("bloqueia resendCampaignAction quando o limite foi excedido, sem criar cópia", async () => {
    checkRateLimitMock.mockReturnValue({ allowed: false, retryAfterMs: 5000 });

    const result = await resendCampaignAction("campaign-1");

    expect(result.success).toBe(false);
    expect(resendCampaignMock).not.toHaveBeenCalled();
    expect(dispatchCampaignMock).not.toHaveBeenCalled();
  });
});
