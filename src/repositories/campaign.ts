// Repository de campanhas — acesso a dados via Prisma (CRUD + consultas).
import type {
  Campaign,
  CampaignField,
  Prisma,
} from "@/generated/prisma/client";
import {
  CampaignStatus,
  CampaignType,
  Channel,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type CampaignWithRelations = Prisma.CampaignGetPayload<{
  include: { field: true; template: true };
}>;

export type CampaignFieldData = {
  titulo?: string | null;
  subtitulo?: string | null;
  texto?: string | null;
  banner?: string | null;
  imagem?: string | null;
  imagens?: string[];
  link?: string | null;
  botao?: string | null;
  preco?: string | null;
  desconto?: string | null;
  validade?: Date | null;
  observacoes?: string | null;
};

export type CreateCampaignData = {
  nome: string;
  type?: CampaignType;
  status?: CampaignStatus;
  channel?: Channel | null;
  channels?: Channel[];
  templateId?: string | null;
  creatorId?: string | null;
  scheduledAt?: Date | null;
  wizardStep?: string | null;
  recipientContactIds?: string[];
  recipientGroupIds?: string[];
  field?: CampaignFieldData;
};

export type UpdateCampaignData = Partial<
  CreateCampaignData & { sentAt?: Date | null }
>;

export type CampaignListQuery = {
  search?: string;
  status?: CampaignStatus;
  type?: CampaignType;
  skip?: number;
  take?: number;
};

export type CampaignListResult = {
  items: CampaignWithRelations[];
  total: number;
};

const campaignInclude = { field: true, template: true } as const;

function buildWhere(query: CampaignListQuery): Prisma.CampaignWhereInput {
  const where: Prisma.CampaignWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.search) {
    const term = query.search.trim();
    if (term) {
      where.OR = [
        { nome: { contains: term, mode: "insensitive" } },
        { field: { titulo: { contains: term, mode: "insensitive" } } },
      ];
    }
  }

  return where;
}

function normalizeFieldData(field?: CampaignFieldData) {
  if (!field) return undefined;

  return {
    titulo: field.titulo ?? null,
    subtitulo: field.subtitulo ?? null,
    texto: field.texto ?? null,
    banner: field.banner ?? null,
    imagem: field.imagem ?? null,
    imagens: field.imagens ?? [],
    link: field.link ?? null,
    botao: field.botao ?? null,
    preco: field.preco ?? null,
    desconto: field.desconto ?? null,
    validade: field.validade ?? null,
    observacoes: field.observacoes ?? null,
  };
}

export async function createCampaign(
  data: CreateCampaignData,
): Promise<CampaignWithRelations> {
  const fieldData = normalizeFieldData(data.field);

  return prisma.campaign.create({
    data: {
      nome: data.nome,
      type: data.type,
      status: data.status,
      channel: data.channel,
      channels: data.channels ?? [],
      templateId: data.templateId,
      creatorId: data.creatorId,
      scheduledAt: data.scheduledAt,
      wizardStep: data.wizardStep,
      recipientContactIds: data.recipientContactIds ?? [],
      recipientGroupIds: data.recipientGroupIds ?? [],
      field: fieldData ? { create: fieldData } : undefined,
    },
    include: campaignInclude,
  });
}

export async function updateCampaign(
  id: string,
  data: UpdateCampaignData,
): Promise<CampaignWithRelations> {
  const fieldData = normalizeFieldData(data.field);

  return prisma.campaign.update({
    where: { id },
    data: {
      nome: data.nome,
      type: data.type,
      status: data.status,
      channel: data.channel,
      channels: data.channels,
      templateId: data.templateId,
      scheduledAt: data.scheduledAt,
      sentAt: data.sentAt,
      wizardStep: data.wizardStep,
      recipientContactIds: data.recipientContactIds,
      recipientGroupIds: data.recipientGroupIds,
      field: fieldData
        ? {
            upsert: {
              create: fieldData,
              update: fieldData,
            },
          }
        : undefined,
    },
    include: campaignInclude,
  });
}

export async function deleteCampaign(id: string): Promise<Campaign> {
  return prisma.campaign.delete({ where: { id } });
}

export async function findCampaignById(
  id: string,
): Promise<CampaignWithRelations | null> {
  return prisma.campaign.findUnique({
    where: { id },
    include: campaignInclude,
  });
}

/**
 * Busca campanha pelo slug público — apenas campanhas já enviadas são
 * expostas na landing page pública.
 */
export async function findCampaignByPublicSlug(
  slug: string,
): Promise<CampaignWithRelations | null> {
  return prisma.campaign.findFirst({
    where: { publicSlug: slug, status: CampaignStatus.sent },
    include: campaignInclude,
  });
}

export async function setCampaignPublicSlug(
  id: string,
  slug: string,
): Promise<void> {
  await prisma.campaign.update({
    where: { id },
    data: { publicSlug: slug },
  });
}

/// Persiste o link/botão efetivamente enviados (landing gerada no dispatch).
export async function updateCampaignFieldLink(
  campaignId: string,
  link: string,
  botao: string,
): Promise<void> {
  await prisma.campaignField.update({
    where: { campaignId },
    data: { link, botao },
  });
}

export async function findDueScheduledCampaigns(
  limit = 50,
): Promise<CampaignWithRelations[]> {
  return prisma.campaign.findMany({
    where: {
      status: CampaignStatus.scheduled,
      scheduledAt: { lte: new Date() },
    },
    include: campaignInclude,
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });
}

/**
 * Reivindica atomicamente uma campanha rascunho para envio imediato.
 * Transiciona `draft` → `sent` de forma atômica para evitar envios duplicados
 * em requisições concorrentes. Retorna false se a campanha já foi enviada.
 */
export async function claimDraftCampaignForDispatch(
  id: string,
): Promise<boolean> {
  const result = await prisma.campaign.updateMany({
    where: { id, status: CampaignStatus.draft },
    data: {
      status: CampaignStatus.sent,
      sentAt: new Date(),
      wizardStep: "enviar",
    },
  });
  return result.count === 1;
}

/**
 * Reivindica atomicamente uma campanha agendada vencida para envio.
 * Transiciona `scheduled` → `draft` para que o módulo `sending` processe o disparo.
 * Retorna false se outra execução já reivindicou a campanha (idempotência).
 */
export async function claimScheduledCampaign(id: string): Promise<boolean> {
  const result = await prisma.campaign.updateMany({
    where: {
      id,
      status: CampaignStatus.scheduled,
      scheduledAt: { lte: new Date() },
    },
    data: {
      status: CampaignStatus.draft,
    },
  });

  return result.count === 1;
}

export async function listCampaigns(
  query: CampaignListQuery,
): Promise<CampaignListResult> {
  const where = buildWhere(query);

  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: campaignInclude,
      orderBy: { updatedAt: "desc" },
      skip: query.skip,
      take: query.take,
    }),
    prisma.campaign.count({ where }),
  ]);

  return { items, total };
}

export async function duplicateCampaignRecord(
  source: CampaignWithRelations,
  creatorId: string,
): Promise<CampaignWithRelations> {
  const field = source.field;

  return createCampaign({
    nome: `Cópia de ${source.nome}`,
    type: source.type,
    status: CampaignStatus.draft,
    channel: source.channel,
    channels: source.channels,
    templateId: source.templateId,
    creatorId,
    wizardStep: source.wizardStep,
    recipientContactIds: [...source.recipientContactIds],
    recipientGroupIds: [...source.recipientGroupIds],
    field: field
      ? {
          titulo: field.titulo,
          subtitulo: field.subtitulo,
          texto: field.texto,
          banner: field.banner,
          imagem: field.imagem,
          imagens: [...field.imagens],
          link: field.link,
          botao: field.botao,
          preco: field.preco,
          desconto: field.desconto,
          validade: field.validade,
          observacoes: field.observacoes,
        }
      : undefined,
  });
}

export type { CampaignField };
