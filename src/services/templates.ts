// Serviço de templates — regras de negócio, validação Zod e auditoria.
import { ZodError } from "zod";

import { TemplateType } from "@/generated/prisma/enums";
import { TemplateValidationError } from "@/lib/template-errors";
import { auditLog } from "@/services/audit-log";
import {
  createTemplate,
  deleteTemplate,
  findTemplateById,
  listTemplateCategories,
  listTemplates,
  updateTemplate,
  type TemplateListQuery,
  type TemplateListResult,
} from "@/repositories/template";
import {
  normalizeOptionalString,
  templateContentSchema,
  templateFormSchema,
  templateListFiltersSchema,
  type TemplateContentInput,
  type TemplateFormInput,
  type TemplateListFiltersInput,
} from "@/schemas/template";

export type TemplateDto = {
  id: string;
  nome: string;
  type: TemplateType;
  category: string | null;
  favorite: boolean;
  conteudo: TemplateContentInput;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TemplateListResponse = {
  items: TemplateDto[];
  total: number;
  page: number;
  pageSize: number;
};

function formatZodError(error: ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}

function serializeContent(content: TemplateContentInput): string {
  return JSON.stringify(content);
}

function parseStoredContent(raw: string | null): TemplateContentInput {
  if (!raw) {
    throw new TemplateValidationError("Conteúdo do template inválido");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new TemplateValidationError("Conteúdo do template inválido");
  }

  const result = templateContentSchema.safeParse(parsed);
  if (!result.success) {
    throw new TemplateValidationError(formatZodError(result.error));
  }

  return result.data;
}

function toTemplateDto(template: {
  id: string;
  nome: string;
  type: TemplateType;
  category: string | null;
  favorite: boolean;
  conteudo: string | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TemplateDto {
  return {
    id: template.id,
    nome: template.nome,
    type: template.type,
    category: template.category,
    favorite: template.favorite,
    conteudo: parseStoredContent(template.conteudo),
    authorId: template.authorId,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

function toCreateData(
  input: TemplateFormInput,
  authorId?: string | null,
): {
  nome: string;
  type: TemplateType;
  category: string | null;
  conteudo: string;
  favorite: boolean;
  authorId?: string | null;
} {
  return {
    nome: input.nome.trim(),
    type: input.type,
    category: normalizeOptionalString(input.category),
    conteudo: serializeContent(input.conteudo),
    favorite: input.favorite,
    authorId,
  };
}

export class TemplateService {
  async createTemplate(
    input: TemplateFormInput,
    actorId: string,
  ): Promise<TemplateDto> {
    const parsed = this.parseTemplateInput(input);
    const template = await createTemplate(toCreateData(parsed, actorId));

    await auditLog({
      actorId,
      action: "template.created",
      entity: "Template",
      entityId: template.id,
      payload: { nome: template.nome, type: template.type },
    });

    return toTemplateDto(template);
  }

  async updateTemplate(
    id: string,
    input: TemplateFormInput,
    actorId: string,
  ): Promise<TemplateDto> {
    const existing = await findTemplateById(id);
    if (!existing) {
      throw new TemplateValidationError("Template não encontrado");
    }

    const parsed = this.parseTemplateInput(input);
    const template = await updateTemplate(id, toCreateData(parsed));

    await auditLog({
      actorId,
      action: "template.updated",
      entity: "Template",
      entityId: template.id,
      payload: { nome: template.nome },
    });

    return toTemplateDto(template);
  }

  async deleteTemplate(id: string, actorId: string): Promise<void> {
    const existing = await findTemplateById(id);
    if (!existing) {
      throw new TemplateValidationError("Template não encontrado");
    }

    await deleteTemplate(id);

    await auditLog({
      actorId,
      action: "template.deleted",
      entity: "Template",
      entityId: id,
      payload: { nome: existing.nome },
    });
  }

  async getTemplateById(id: string): Promise<TemplateDto | null> {
    const template = await findTemplateById(id);
    return template ? toTemplateDto(template) : null;
  }

  async listTemplates(
    filters: TemplateListFiltersInput,
  ): Promise<TemplateListResponse> {
    const parsed = templateListFiltersSchema.parse(filters);
    const skip = (parsed.page - 1) * parsed.pageSize;

    const query: TemplateListQuery = {
      search: parsed.search,
      type: parsed.type,
      category: parsed.category,
      favoritesOnly: parsed.favoritesOnly,
      skip,
      take: parsed.pageSize,
    };

    const result: TemplateListResult = await listTemplates(query);

    return {
      items: result.items.map(toTemplateDto),
      total: result.total,
      page: parsed.page,
      pageSize: parsed.pageSize,
    };
  }

  async toggleFavorite(id: string, actorId: string): Promise<TemplateDto> {
    const existing = await findTemplateById(id);
    if (!existing) {
      throw new TemplateValidationError("Template não encontrado");
    }

    const template = await updateTemplate(id, {
      favorite: !existing.favorite,
    });

    await auditLog({
      actorId,
      action: template.favorite ? "template.favorited" : "template.unfavorited",
      entity: "Template",
      entityId: template.id,
    });

    return toTemplateDto(template);
  }

  async duplicateTemplate(id: string, actorId: string): Promise<TemplateDto> {
    const existing = await findTemplateById(id);
    if (!existing) {
      throw new TemplateValidationError("Template não encontrado");
    }

    const template = await createTemplate({
      nome: `Cópia de ${existing.nome}`,
      type: existing.type,
      category: existing.category,
      conteudo: existing.conteudo ?? serializeContent({
        titulo: "Novo template",
        corpo: "Conteúdo",
      }),
      favorite: false,
      authorId: actorId,
    });

    await auditLog({
      actorId,
      action: "template.duplicated",
      entity: "Template",
      entityId: template.id,
      payload: { sourceId: id },
    });

    return toTemplateDto(template);
  }

  async listCategories(): Promise<string[]> {
    return listTemplateCategories();
  }

  private parseTemplateInput(input: TemplateFormInput): TemplateFormInput {
    const result = templateFormSchema.safeParse(input);
    if (!result.success) {
      throw new TemplateValidationError(formatZodError(result.error));
    }
    return result.data;
  }
}

let defaultTemplateService: TemplateService | null = null;

export function getTemplateService(): TemplateService {
  if (!defaultTemplateService) {
    defaultTemplateService = new TemplateService();
  }
  return defaultTemplateService;
}

export function setTemplateServiceForTests(
  service: TemplateService | null,
): void {
  defaultTemplateService = service;
}

export { parseStoredContent, serializeContent, toTemplateDto };
