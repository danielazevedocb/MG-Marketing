// Seed idempotente do MG Marketing.
// Popula dados iniciais (usuário Administrador, grupos, tags, template e campanha de exemplo)
// usando `upsert` ou chaves estáveis, de modo que executar mais de uma vez NÃO duplica registros.
//
// Execução: `npx prisma db seed` (configurado em `prisma.config.ts` → `tsx prisma/seed.ts`).
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

/// Cliente Prisma usado pelo seed (driver adapter PostgreSQL — Prisma v7).
type SeedClient = Pick<
  PrismaClient,
  "user" | "group" | "tag" | "template" | "campaign"
>;

// Email do administrador inicial (sobrescrevível por env em ambientes reais).
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@teste.com";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Administrador MG";
// Senha inicial do admin (dev: default abaixo; produção: defina SEED_ADMIN_PASSWORD no env).
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
/// Mesmo fator de custo usado em bcryptjs (padrão da lib para novos hashes).
const BCRYPT_ROUNDS = 10;

const SAMPLE_GROUPS = [
  { nome: "Clientes", descricao: "Contatos de clientes ativos" },
  { nome: "Leads", descricao: "Potenciais clientes em prospecção" },
  { nome: "Parceiros", descricao: "Parceiros comerciais" },
] as const;

/** Renomeações de grupos legados aplicadas antes do upsert (idempotente). */
const LEGACY_GROUP_RENAMES: Record<string, string> = {
  Fornecedores: "Parceiros",
};

const SAMPLE_TAGS = [
  { nome: "VIP", cor: "#f59e0b" },
  { nome: "Newsletter", cor: "#3b82f6" },
  { nome: "Promoções", cor: "#10b981" },
] as const;

/** IDs fixos para upsert idempotente (sem @unique em `nome` de template/campaign). */
export const SAMPLE_TEMPLATE_ID = "seed-template-promocao-sazonal";
export const SAMPLE_CAMPAIGN_ID = "seed-campaign-boas-vindas";

export const SAMPLE_TEMPLATE = {
  nome: "Promoção Sazonal",
  type: "Promocao" as const,
  category: "Sazonal",
  favorite: false,
  conteudo: {
    titulo: "Ofertas de Inverno",
    subtitulo: "Descontos exclusivos para clientes MG",
    corpo:
      "Aproveite nossa seleção especial de produtos com condições imperdíveis. Válido enquanto durarem os estoques.",
    ctaTexto: "Ver ofertas",
    ctaUrl: "https://exemplo.com.br/promocoes",
    bannerUrl: "",
    precoOriginal: "R$ 199,90",
    precoPromocional: "R$ 149,90",
    validade: "31/08/2026",
    nomeProduto: "",
    preco: "",
    destaque: "Até 25% de desconto",
  },
} as const;

export const SAMPLE_CAMPAIGN = {
  nome: "Campanha de Boas-vindas",
  type: "Geral" as const,
  status: "draft" as const,
  channels: ["Email", "WhatsApp"] as const,
  wizardStep: "preview",
  field: {
    titulo: "Bem-vindo à MG Marketing!",
    subtitulo: "Estamos felizes em ter você conosco",
    texto:
      "Olá! Obrigado por se cadastrar. Confira nossas novidades e ofertas exclusivas preparadas especialmente para novos clientes.",
    banner: null as string | null,
    imagem: null as string | null,
    link: "https://exemplo.com.br/boas-vindas",
    botao: "Conhecer a loja",
    preco: null as string | null,
    desconto: null as string | null,
    validade: null as Date | null,
    observacoes: "Campanha de exemplo criada pelo seed.",
  },
} as const;

/**
 * Aplica o seed de forma idempotente.
 * Recebe o cliente por injeção para permitir testes (mock) sem acoplar à instância real.
 */
export async function seed(prisma: SeedClient): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  // Usuário Administrador (idempotente por email único).
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, role: "Administrador", passwordHash },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "Administrador",
      passwordHash,
    },
  });

  // Renomeia grupos legados (ex.: "Fornecedores" → "Parceiros") sem duplicar.
  for (const [oldNome, newNome] of Object.entries(LEGACY_GROUP_RENAMES)) {
    const targetExists = await prisma.group.findUnique({
      where: { nome: newNome },
    });
    if (!targetExists) {
      await prisma.group.updateMany({
        where: { nome: oldNome },
        data: { nome: newNome },
      });
    }
  }

  // Grupos de exemplo (idempotentes por `nome` único).
  for (const group of SAMPLE_GROUPS) {
    await prisma.group.upsert({
      where: { nome: group.nome },
      update: { descricao: group.descricao },
      create: { nome: group.nome, descricao: group.descricao },
    });
  }

  // Tags de exemplo (idempotentes por `nome` único).
  for (const tag of SAMPLE_TAGS) {
    await prisma.tag.upsert({
      where: { nome: tag.nome },
      update: { cor: tag.cor },
      create: { nome: tag.nome, cor: tag.cor },
    });
  }

  const templateData = {
    nome: SAMPLE_TEMPLATE.nome,
    type: SAMPLE_TEMPLATE.type,
    category: SAMPLE_TEMPLATE.category,
    conteudo: JSON.stringify(SAMPLE_TEMPLATE.conteudo),
    favorite: SAMPLE_TEMPLATE.favorite,
    authorId: adminUser.id,
  };

  // Template de marketing de exemplo (idempotente por `id` fixo).
  await prisma.template.upsert({
    where: { id: SAMPLE_TEMPLATE_ID },
    update: templateData,
    create: { id: SAMPLE_TEMPLATE_ID, ...templateData },
  });

  const leadsGroup = await prisma.group.findUnique({
    where: { nome: "Leads" },
    select: { id: true },
  });

  const campaignData = {
    nome: SAMPLE_CAMPAIGN.nome,
    type: SAMPLE_CAMPAIGN.type,
    status: SAMPLE_CAMPAIGN.status,
    channels: [...SAMPLE_CAMPAIGN.channels],
    templateId: SAMPLE_TEMPLATE_ID,
    creatorId: adminUser.id,
    wizardStep: SAMPLE_CAMPAIGN.wizardStep,
    recipientContactIds: [] as string[],
    recipientGroupIds: leadsGroup ? [leadsGroup.id] : ([] as string[]),
  };

  const campaignField = SAMPLE_CAMPAIGN.field;

  // Campanha rascunho de exemplo (idempotente por `id` fixo).
  await prisma.campaign.upsert({
    where: { id: SAMPLE_CAMPAIGN_ID },
    update: {
      ...campaignData,
      field: {
        upsert: {
          create: campaignField,
          update: campaignField,
        },
      },
    },
    create: {
      id: SAMPLE_CAMPAIGN_ID,
      ...campaignData,
      field: { create: campaignField },
    },
  });
}

async function main(): Promise<void> {
  const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await seed(prisma);
    console.log("Seed concluído com sucesso (idempotente).");
  } finally {
    await prisma.$disconnect();
  }
}

// Executa apenas quando chamado diretamente (não durante import em testes).
const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === `file://${process.argv[1]}`;

if (isDirectRun) {
  main().catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exit(1);
  });
}
