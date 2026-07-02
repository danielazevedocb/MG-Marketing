// Repository de contatos — acesso a dados via Prisma (CRUD + filtros).
import type { Contact, Prisma } from "@/generated/prisma/client";
import { ContactStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type ContactWithRelations = Prisma.ContactGetPayload<{
  include: { groups: true; tags: true };
}>;

export type CreateContactData = {
  nome?: string | null;
  empresa: string;
  telefone?: string | null;
  email?: string | null;
  status?: ContactStatus;
  groupIds?: string[];
  tagIds?: string[];
};

export type UpdateContactData = Partial<CreateContactData>;

export type ContactListQuery = {
  search?: string;
  status?: ContactStatus;
  groupId?: string;
  tagId?: string;
  skip?: number;
  take?: number;
};

export type ContactListResult = {
  items: ContactWithRelations[];
  total: number;
};

const contactInclude = { groups: true, tags: true } as const;

function buildWhere(query: ContactListQuery): Prisma.ContactWhereInput {
  const where: Prisma.ContactWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.groupId) {
    where.groups = { some: { id: query.groupId } };
  }

  if (query.tagId) {
    where.tags = { some: { id: query.tagId } };
  }

  if (query.search) {
    const term = query.search.trim();
    if (term) {
      where.OR = [
        { empresa: { contains: term, mode: "insensitive" } },
        { nome: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { telefone: { contains: term, mode: "insensitive" } },
      ];
    }
  }

  return where;
}

function relationConnect(ids?: string[]) {
  if (!ids || ids.length === 0) return undefined;
  return { connect: ids.map((id) => ({ id })) };
}

export async function createContact(
  data: CreateContactData,
): Promise<ContactWithRelations> {
  return prisma.contact.create({
    data: {
      nome: data.nome,
      empresa: data.empresa,
      telefone: data.telefone,
      email: data.email,
      status: data.status ?? ContactStatus.Ativo,
      groups: relationConnect(data.groupIds),
      tags: relationConnect(data.tagIds),
    },
    include: contactInclude,
  });
}

export async function updateContact(
  id: string,
  data: UpdateContactData,
): Promise<ContactWithRelations> {
  const updateData: Prisma.ContactUpdateInput = {};

  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.empresa !== undefined) updateData.empresa = data.empresa;
  if (data.telefone !== undefined) updateData.telefone = data.telefone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.groupIds !== undefined) {
    updateData.groups = {
      set: data.groupIds.map((groupId) => ({ id: groupId })),
    };
  }

  if (data.tagIds !== undefined) {
    updateData.tags = { set: data.tagIds.map((tagId) => ({ id: tagId })) };
  }

  return prisma.contact.update({
    where: { id },
    data: updateData,
    include: contactInclude,
  });
}

export async function deleteContact(id: string): Promise<Contact> {
  return prisma.contact.delete({ where: { id } });
}

export async function findContactById(
  id: string,
): Promise<ContactWithRelations | null> {
  return prisma.contact.findUnique({
    where: { id },
    include: contactInclude,
  });
}

export async function listContacts(
  query: ContactListQuery,
): Promise<ContactListResult> {
  const where = buildWhere(query);

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: contactInclude,
      orderBy: { updatedAt: "desc" },
      skip: query.skip,
      take: query.take,
    }),
    prisma.contact.count({ where }),
  ]);

  return { items, total };
}

export async function createContactsBatch(
  contacts: CreateContactData[],
): Promise<ContactWithRelations[]> {
  if (contacts.length === 0) return [];

  return prisma.$transaction(
    contacts.map((contact) =>
      prisma.contact.create({
        data: {
          nome: contact.nome,
          empresa: contact.empresa,
          telefone: contact.telefone,
          email: contact.email,
          status: contact.status ?? ContactStatus.Ativo,
          groups: relationConnect(contact.groupIds),
          tags: relationConnect(contact.tagIds),
        },
        include: contactInclude,
      }),
    ),
  );
}

export async function findContactIdsByGroupIds(
  groupIds: string[],
): Promise<string[]> {
  if (groupIds.length === 0) return [];

  const contacts = await prisma.contact.findMany({
    where: {
      status: ContactStatus.Ativo,
      groups: { some: { id: { in: groupIds } } },
    },
    select: { id: true },
  });

  return contacts.map((contact) => contact.id);
}

export async function findContactsByIds(
  ids: string[],
): Promise<ContactWithRelations[]> {
  if (ids.length === 0) return [];

  return prisma.contact.findMany({
    where: { id: { in: ids } },
    include: contactInclude,
    orderBy: { empresa: "asc" },
  });
}
