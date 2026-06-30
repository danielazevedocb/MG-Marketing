// Testes offline do schema/migration (não exigem banco).
// Validam que o Prisma Client tipado compila/gera os enums esperados e que a migration
// inicial cria tabelas, enums, índices e constraints conforme o modelo de dados.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CampaignStatus,
  CampaignType,
  Channel,
  ContactStatus,
  FileAssetType,
  ProviderType,
  Role,
  SendStatus,
  TemplateType,
} from "@/generated/prisma/client";

const ROOT = process.cwd();
const schemaSql = readFileSync(
  join(ROOT, "prisma", "migrations", "0_init", "migration.sql"),
  "utf8",
);

describe("enums do Prisma Client", () => {
  it("Role possui os 4 perfis de RBAC", () => {
    expect(Object.values(Role)).toEqual([
      "Administrador",
      "Marketing",
      "Comercial",
      "Visualizador",
    ]);
  });

  it("CampaignStatus cobre draft, scheduled e sent", () => {
    expect(Object.values(CampaignStatus)).toEqual([
      "draft",
      "scheduled",
      "sent",
    ]);
  });

  it("TemplateType e CampaignType cobrem as categorias de conteúdo", () => {
    const categorias = ["Novidade", "Promocao", "Produto", "Geral"];
    expect(Object.values(TemplateType)).toEqual(categorias);
    expect(Object.values(CampaignType)).toEqual(categorias);
  });

  it("ProviderType cobre os provedores de email suportados", () => {
    expect(Object.values(ProviderType)).toEqual([
      "SMTP",
      "Resend",
      "SendGrid",
      "SES",
      "Mailgun",
      "Postmark",
    ]);
  });

  it("FileAssetType cobre as categorias de arquivo", () => {
    expect(Object.values(FileAssetType)).toEqual([
      "banner",
      "logo",
      "imagem",
      "catalogo",
      "pdf",
      "arquivo",
    ]);
  });

  it("Channel, SendStatus e ContactStatus existem", () => {
    expect(Object.values(Channel)).toContain("WhatsApp");
    expect(Object.values(Channel)).toContain("Email");
    expect(Object.values(SendStatus)).toContain("Pendente");
    expect(Object.values(ContactStatus)).toEqual(["Ativo", "Inativo"]);
  });
});

describe("migration inicial (0_init)", () => {
  const tabelas = [
    "User",
    "Account",
    "Session",
    "VerificationToken",
    "Contact",
    "Group",
    "Tag",
    "Template",
    "Campaign",
    "CampaignField",
    "EmailProvider",
    "SendHistory",
    "AuditLog",
    "FileAsset",
  ];

  it.each(tabelas)('cria a tabela "%s"', (tabela) => {
    expect(schemaSql).toContain(`CREATE TABLE "${tabela}"`);
  });

  it("cria as tabelas de junção N:N (Contact↔Group, Contact↔Tag)", () => {
    expect(schemaSql).toContain('CREATE TABLE "_ContactGroups"');
    expect(schemaSql).toContain('CREATE TABLE "_ContactTags"');
  });

  it("cria todos os enums do domínio", () => {
    for (const enumName of [
      "Role",
      "ContactStatus",
      "TemplateType",
      "CampaignType",
      "CampaignStatus",
      "Channel",
      "SendStatus",
      "ProviderType",
      "FileAssetType",
    ]) {
      expect(schemaSql).toContain(`CREATE TYPE "${enumName}"`);
    }
  });

  it("garante unicidade de email do User (@unique)", () => {
    expect(schemaSql).toContain(
      'CREATE UNIQUE INDEX "User_email_key" ON "User"("email")',
    );
  });

  it("cria índices de busca de Contact (email, telefone, status)", () => {
    expect(schemaSql).toContain('CREATE INDEX "Contact_email_idx"');
    expect(schemaSql).toContain('CREATE INDEX "Contact_telefone_idx"');
    expect(schemaSql).toContain('CREATE INDEX "Contact_status_idx"');
  });

  it("define DEFAULT 'draft' para Campaign.status", () => {
    expect(schemaSql).toMatch(/"status"\s+"CampaignStatus"\s+NOT NULL DEFAULT 'draft'/);
  });

  it("define foreign keys com integridade relacional", () => {
    expect(schemaSql).toContain(
      'ALTER TABLE "CampaignField" ADD CONSTRAINT "CampaignField_campaignId_fkey"',
    );
    expect(schemaSql).toContain(
      'ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"',
    );
  });
});
