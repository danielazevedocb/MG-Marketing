// Repository de grupos — CRUD e listagem.
import type { Group, Prisma } from "@/generated/prisma/client";
import { ContactStatus } from "@/generated/prisma/enums";
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

export async function findExistingGroupIds(
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  const groups = await prisma.group.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  return new Set(groups.map((group) => group.id));
}

/**
 * Resolve os contatos ativos de vários grupos em uma única query, retornando
 * o mapeamento grupo → ids de contato. Usado para evitar N+1 ao montar DTOs
 * de uma página inteira de campanhas (uma query por campanha com grupos).
 */
export async function findContactIdsByGroupIdsBatch(
  groupIds: string[],
): Promise<Map<string, string[]>> {
  if (groupIds.length === 0) return new Map();

  const groups = await prisma.group.findMany({
    where: { id: { in: groupIds } },
    select: {
      id: true,
      contacts: {
        where: { status: ContactStatus.Ativo },
        select: { id: true },
      },
    },
  });

  return new Map(
    groups.map((group) => [group.id, group.contacts.map((c) => c.id)]),
  );
}
