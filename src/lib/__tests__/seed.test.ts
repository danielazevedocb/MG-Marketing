// Testes do seed (offline, com mock) — validam a IDEMPOTÊNCIA da lógica de seed sem banco.
// O comportamento idempotente real (sem duplicação) também é coberto por teste de integração
// quando `DATABASE_URL_TEST` está definido (ver prisma-integration.test.ts).
import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";

import {
  SAMPLE_CAMPAIGN,
  SAMPLE_CAMPAIGN_ID,
  SAMPLE_TEMPLATE,
  SAMPLE_TEMPLATE_ID,
  seed,
} from "../../../prisma/seed";

function createMockClient() {
  return {
    user: {
      upsert: vi.fn().mockResolvedValue({ id: "admin-user-id" }),
    },
    group: {
      findUnique: vi.fn().mockResolvedValue({ id: "group-leads-id" }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      upsert: vi.fn().mockResolvedValue({}),
    },
    tag: { upsert: vi.fn().mockResolvedValue({}) },
    template: { upsert: vi.fn().mockResolvedValue({ id: SAMPLE_TEMPLATE_ID }) },
    campaign: { upsert: vi.fn().mockResolvedValue({ id: SAMPLE_CAMPAIGN_ID }) },
  };
}

describe("seed idempotente", () => {
  it("usa upsert (update + create) para o usuário Administrador com passwordHash", async () => {
    const prisma = createMockClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);

    expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
    const arg = prisma.user.upsert.mock.calls[0][0];
    expect(arg.where).toEqual({ email: "admin@teste.com" });
    expect(arg.update.role).toBe("Administrador");
    expect(arg.create.role).toBe("Administrador");
    expect(arg.update.passwordHash).toEqual(expect.any(String));
    expect(arg.create.passwordHash).toBe(arg.update.passwordHash);
    await expect(
      bcrypt.compare("Admin@123", arg.create.passwordHash),
    ).resolves.toBe(true);
  });

  it("cria grupos e tags de exemplo via upsert (chave única `nome`)", async () => {
    const prisma = createMockClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);

    expect(prisma.group.upsert).toHaveBeenCalledTimes(3);
    expect(prisma.tag.upsert).toHaveBeenCalledTimes(3);
    for (const call of prisma.group.upsert.mock.calls) {
      expect(call[0].where).toHaveProperty("nome");
    }
  });

  it("cria template e campanha de exemplo via upsert com IDs fixos", async () => {
    const prisma = createMockClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);

    expect(prisma.template.upsert).toHaveBeenCalledTimes(1);
    const templateArg = prisma.template.upsert.mock.calls[0][0];
    expect(templateArg.where).toEqual({ id: SAMPLE_TEMPLATE_ID });
    expect(templateArg.create.nome).toBe(SAMPLE_TEMPLATE.nome);
    expect(templateArg.create.type).toBe(SAMPLE_TEMPLATE.type);
    expect(templateArg.create.authorId).toBe("admin-user-id");
    expect(JSON.parse(templateArg.create.conteudo)).toEqual(
      SAMPLE_TEMPLATE.conteudo,
    );

    expect(prisma.campaign.upsert).toHaveBeenCalledTimes(1);
    const campaignArg = prisma.campaign.upsert.mock.calls[0][0];
    expect(campaignArg.where).toEqual({ id: SAMPLE_CAMPAIGN_ID });
    expect(campaignArg.create.nome).toBe(SAMPLE_CAMPAIGN.nome);
    expect(campaignArg.create.status).toBe("draft");
    expect(campaignArg.create.templateId).toBe(SAMPLE_TEMPLATE_ID);
    expect(campaignArg.create.creatorId).toBe("admin-user-id");
    expect(campaignArg.create.wizardStep).toBe("preview");
    expect(campaignArg.create.channels).toEqual(["Email", "WhatsApp"]);
    expect(campaignArg.create.recipientGroupIds).toEqual(["group-leads-id"]);
    expect(campaignArg.create.field.create).toEqual(SAMPLE_CAMPAIGN.field);
  });

  it("executar duas vezes não acumula operações (idempotência)", async () => {
    const prisma = createMockClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seed(prisma as any);

    // Cada execução repete exatamente o mesmo conjunto de upserts (sem inserts incrementais).
    expect(prisma.user.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.group.upsert).toHaveBeenCalledTimes(6);
    expect(prisma.tag.upsert).toHaveBeenCalledTimes(6);
    expect(prisma.template.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.campaign.upsert).toHaveBeenCalledTimes(2);
  });
});
