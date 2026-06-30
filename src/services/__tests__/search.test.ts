import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/enums";

const listCampaignsMock = vi.fn();
const listTemplatesMock = vi.fn();
const listContactsMock = vi.fn();

vi.mock("@/repositories/campaign", () => ({
  listCampaigns: (...args: unknown[]) => listCampaignsMock(...args),
}));

vi.mock("@/repositories/template", () => ({
  listTemplates: (...args: unknown[]) => listTemplatesMock(...args),
}));

vi.mock("@/repositories/contact", () => ({
  listContacts: (...args: unknown[]) => listContactsMock(...args),
}));

import { globalSearch } from "@/services/search";

describe("globalSearch RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listCampaignsMock.mockResolvedValue({
      items: [{ id: "c1", nome: "Campanha A", status: "draft" }],
      total: 1,
    });
    listTemplatesMock.mockResolvedValue({
      items: [
        {
          id: "t1",
          nome: "Template A",
          category: "Promo",
          favorite: true,
        },
      ],
      total: 1,
    });
    listContactsMock.mockResolvedValue({
      items: [{ id: "ct1", empresa: "Empresa X", nome: "João" }],
      total: 1,
    });
  });

  it("não consulta campanhas quando o perfil não tem campaigns:read", async () => {
    const permissions = await import("@/lib/permissions");
    const spy = vi
      .spyOn(permissions, "hasPermission")
      .mockImplementation((_role, permission) => permission !== "campaigns:read");

    const result = await globalSearch({ query: "campanha", limit: 5 }, Role.Visualizador);

    expect(listCampaignsMock).not.toHaveBeenCalled();
    expect(result.groups.some((group) => group.type === "campaign")).toBe(false);
    spy.mockRestore();
  });

  it("retorna favoritos nos resultados de templates", async () => {
    const result = await globalSearch({ query: "template", limit: 5 }, Role.Marketing);

    const templateGroup = result.groups.find((group) => group.type === "template");
    expect(templateGroup?.items[0]?.favorite).toBe(true);
  });
});
