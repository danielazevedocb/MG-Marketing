// Schemas Zod de contatos — validação compartilhada entre formulário e servidor.
import { z } from "zod";

import { ContactStatus } from "@/generated/prisma/enums";
import { entityIdArraySchema, entityIdSchema } from "@/schemas/id";

const telefoneSchema = z
  .string()
  .trim()
  .max(30, "Telefone muito longo")
  .regex(
    /^[\d\s()+\-]*$/,
    "Telefone deve conter apenas números e símbolos válidos (+, -, espaço, parênteses)",
  )
  .optional()
  .or(z.literal(""));

const emailSchema = z
  .string()
  .trim()
  .email("E-mail inválido")
  .max(255, "E-mail muito longo")
  .optional()
  .or(z.literal(""));

export const contactStatusSchema = z.nativeEnum(ContactStatus);

export const contactFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .max(120, "Nome muito longo")
    .optional()
    .or(z.literal("")),
  empresa: z
    .string()
    .trim()
    .min(1, "Empresa é obrigatória")
    .max(200, "Empresa muito longa"),
  telefone: telefoneSchema,
  email: emailSchema,
  status: contactStatusSchema,
  groupIds: entityIdArraySchema("Grupo"),
  tagIds: entityIdArraySchema("Tag"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const contactListFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: contactStatusSchema.optional(),
  groupId: entityIdSchema("Grupo").optional(),
  tagId: entityIdSchema("Tag").optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ContactListFiltersInput = z.infer<typeof contactListFiltersSchema>;

/// Linha de importação CSV — colunas esperadas: empresa, telefone, email, status, nome.
export const csvContactRowSchema = z.object({
  empresa: z
    .string()
    .trim()
    .min(1, "Empresa é obrigatória")
    .max(200, "Empresa muito longa"),
  telefone: telefoneSchema,
  email: emailSchema,
  status: contactStatusSchema.default(ContactStatus.Ativo),
  nome: z
    .string()
    .trim()
    .max(120, "Nome muito longo")
    .optional()
    .or(z.literal("")),
});

export type CsvContactRow = z.infer<typeof csvContactRowSchema>;

export const groupFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome do grupo é obrigatório")
    .max(120, "Nome muito longo"),
  descricao: z
    .string()
    .trim()
    .max(500, "Descrição muito longa")
    .optional()
    .or(z.literal("")),
});

export type GroupFormInput = z.infer<typeof groupFormSchema>;

export const tagFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome da tag é obrigatório")
    .max(80, "Nome muito longo"),
  cor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um hex válido (#RRGGBB)")
    .optional()
    .or(z.literal("")),
});

export type TagFormInput = z.infer<typeof tagFormSchema>;

/// Normaliza strings opcionais vazias para `null` antes de persistir.
export function normalizeOptionalString(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
