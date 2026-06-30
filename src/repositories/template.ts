// Repository de templates — acesso a dados via Prisma (CRUD + consultas).
import type { Prisma, Template } from "@/generated/prisma/client";
import { TemplateType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type CreateTemplateData = {
  nome: string;
  type: TemplateType;
  category?: string | null;
  conteudo: string;
  favorite?: boolean;
  authorId?: string | null;
};

export type UpdateTemplateData = Partial<CreateTemplateData>;

export type TemplateListQuery = {
  search?: string;
  type?: TemplateType;
  category?: string;
  favoritesOnly?: boolean;
  skip?: number;
  take?: number;
};

export type TemplateListResult = {
  items: Template[];
  total: number;
};

function buildWhere(query: TemplateListQuery): Prisma.TemplateWhereInput {
  const where: Prisma.TemplateWhereInput = {};

  if (query.type) {
    where.type = query.type;
  }

  if (query.category) {
    where.category = { equals: query.category, mode: "insensitive" };
  }

  if (query.favoritesOnly) {
    where.favorite = true;
  }

  if (query.search) {
    const term = query.search.trim();
    if (term) {
      where.OR = [
        { nome: { contains: term, mode: "insensitive" } },
        { category: { contains: term, mode: "insensitive" } },
        { conteudo: { contains: term, mode: "insensitive" } },
      ];
    }
  }

  return where;
}

export async function createTemplate(
  data: CreateTemplateData,
): Promise<Template> {
  return prisma.template.create({ data });
}

export async function updateTemplate(
  id: string,
  data: UpdateTemplateData,
): Promise<Template> {
  return prisma.template.update({ where: { id }, data });
}

export async function deleteTemplate(id: string): Promise<Template> {
  return prisma.template.delete({ where: { id } });
}

export async function findTemplateById(id: string): Promise<Template | null> {
  return prisma.template.findUnique({ where: { id } });
}

export async function listTemplates(
  query: TemplateListQuery,
): Promise<TemplateListResult> {
  const where = buildWhere(query);

  const [items, total] = await Promise.all([
    prisma.template.findMany({
      where,
      orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
      skip: query.skip,
      take: query.take,
    }),
    prisma.template.count({ where }),
  ]);

  return { items, total };
}

export async function listTemplateCategories(): Promise<string[]> {
  const rows = await prisma.template.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return rows
    .map((row) => row.category)
    .filter((category): category is string => Boolean(category));
}
