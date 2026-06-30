// Repository de tags — CRUD e listagem.
import type { Tag, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type TagWithCount = Prisma.TagGetPayload<{
  include: { _count: { select: { contacts: true } } };
}>;

export type CreateTagData = {
  nome: string;
  cor?: string | null;
};

export type UpdateTagData = Partial<CreateTagData>;

export async function createTag(data: CreateTagData): Promise<Tag> {
  return prisma.tag.create({ data });
}

export async function updateTag(id: string, data: UpdateTagData): Promise<Tag> {
  return prisma.tag.update({ where: { id }, data });
}

export async function deleteTag(id: string): Promise<Tag> {
  return prisma.tag.delete({ where: { id } });
}

export async function findTagById(id: string): Promise<Tag | null> {
  return prisma.tag.findUnique({ where: { id } });
}

export async function listTags(): Promise<TagWithCount[]> {
  return prisma.tag.findMany({
    include: { _count: { select: { contacts: true } } },
    orderBy: { nome: "asc" },
  });
}
