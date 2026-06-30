// Repository de grupos — CRUD e listagem.
import type { Group, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type GroupWithCount = Prisma.GroupGetPayload<{
  include: { _count: { select: { contacts: true } } };
}>;

export type CreateGroupData = {
  nome: string;
  descricao?: string | null;
};

export type UpdateGroupData = Partial<CreateGroupData>;

export async function createGroup(data: CreateGroupData): Promise<Group> {
  return prisma.group.create({ data });
}

export async function updateGroup(
  id: string,
  data: UpdateGroupData,
): Promise<Group> {
  return prisma.group.update({ where: { id }, data });
}

export async function deleteGroup(id: string): Promise<Group> {
  return prisma.group.delete({ where: { id } });
}

export async function findGroupById(id: string): Promise<Group | null> {
  return prisma.group.findUnique({ where: { id } });
}

export async function listGroups(): Promise<GroupWithCount[]> {
  return prisma.group.findMany({
    include: { _count: { select: { contacts: true } } },
    orderBy: { nome: "asc" },
  });
}
