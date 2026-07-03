// Serviço de campanhas — regras de negócio, wizard, rascunho e auditoria.
import {
  CampaignStatus,
  CampaignType,
  Channel,
} from "@/generated/prisma/enums";
import {
  CampaignValidationError,
  CampaignWizardError,
} from "@/lib/campaign-errors";
import { auditLog } from "@/services/audit-log";
import { publicSlugSchema } from "@/lib/public-slug";
import {
  createCampaign,
  deleteCampaign,
  duplicateCampaignRecord,
  findCampaignById,
  findCampaignByPublicSlug,
  listCampaigns,
  updateCampaign,
  type CampaignFieldData,
  type CampaignListQuery,
  type CampaignListResult,
  type CampaignWithRelations,
} from "@/repositories/campaign";
import {
  findContactIdsByGroupIds,
  findContactsByIds,
} from "@/repositories/contact";
import { findExistingGroupIds } from "@/repositories/group";
import { findTemplateById } from "@/repositories/template";
import {
  campaignFieldSchema,
  campaignListFiltersSchema,
  campaignWizardStateSchema,
  emptyFieldInput,
  getNextWizardStep,
  formatZodValidationError,
  validateWizardStep,
  type CampaignFieldDraftInput,
  type CampaignFieldInput,
  type CampaignListFiltersInput,
  type CampaignWizardStateInput,
  type WizardStep,
} from "@/schemas/campaign";
import type { TemplateContentInput } from "@/schemas/template";
import { templateContentSchema } from "@/schemas/template";

export type CampaignFieldDto = {
  titulo: string | null;
  subtitulo: string | null;
  texto: string | null;
  banner: string | null;
  imagem: string | null;
  imagens: string[];
  link: string | null;
  botao: string | null;
  preco: string | null;
  desconto: string | null;
  validade: string | null;
  observacoes: string | null;
};

export type CampaignDto = {
  id: string;
  nome: string;
  type: CampaignType;
  status: CampaignStatus;
  channel: Channel | null;
  channels: Channel[];
  templateId: string | null;
  creatorId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  wizardStep: WizardStep | null;
  recipientContactIds: string[];
  recipientGroupIds: string[];
  resolvedRecipientContactIds: string[];
  publicSlug: string | null;
  field: CampaignFieldDto | null;
  createdAt: string;
  updatedAt: string;
};

/// DTO mínimo exposto na landing page pública — sem autor nem destinatários.
export type PublicCampaignDto = {
  type: CampaignType;
  sentAt: string | null;
  field: CampaignFieldDto;
};

export type CampaignListResponse = {
  items: CampaignDto[];
  total: number;
  page: number;
  pageSize: number;
};

export const INCOMPLETE_CAMPAIGN_CONTENT_MESSAGE =
  "Conteúdo da campanha incompleto: título e texto são obrigatórios para envio.";

/** Revalida o conteúdo com o schema estrito antes de enviar/agendar. */
export function assertCampaignContentComplete(
  content: CampaignFieldInput,
): void {
  const result = campaignFieldSchema.safeParse(content);
  if (!result.success) {
    throw new CampaignValidationError(INCOMPLETE_CAMPAIGN_CONTENT_MESSAGE);
  }
}

function parseValidade(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new CampaignValidationError("Data de validade inválida");
  }
  return date;
}

function fieldToDto(
  field: CampaignWithRelations["field"],
): CampaignFieldDto | null {
  if (!field) return null;

  return {
    titulo: field.titulo,
    subtitulo: field.subtitulo,
    texto: field.texto,
    banner: field.banner,
    imagem: field.imagem,
    imagens: field.imagens ?? [],
    link: field.link,
    botao: field.botao,
    preco: field.preco,
    desconto: field.desconto,
    validade: field.validade?.toISOString() ?? null,
    observacoes: field.observacoes,
  };
}

function fieldInputToData(input: CampaignFieldDraftInput): CampaignFieldData {
  return {
    titulo: input.titulo || null,
    subtitulo: input.subtitulo || null,
    texto: input.texto || null,
    banner: input.banner || null,
    imagem: input.imagem || null,
    imagens: input.imagens ?? [],
    link: input.link || null,
    botao: input.botao || null,
    preco: input.preco || null,
    desconto: input.desconto || null,
    validade: parseValidade(input.validade),
    observacoes: input.observacoes || null,
  };
}

function emptyFieldInputLocal(): CampaignFieldInput {
  return emptyFieldInput();
}

function fieldToInput(field: CampaignFieldDto | null): CampaignFieldInput {
  if (!field) return emptyFieldInputLocal();

  return {
    titulo: field.titulo ?? "",
    subtitulo: field.subtitulo ?? "",
    texto: field.texto ?? "",
    banner: field.banner ?? "",
    imagem: field.imagem ?? "",
    imagens: field.imagens ?? [],
    link: field.link ?? "",
    botao: field.botao ?? "",
    preco: field.preco ?? "",
    desconto: field.desconto ?? "",
    validade: field.validade ?? "",
    observacoes: field.observacoes ?? "",
  };
}

export function templateContentToCampaignField(
  content: TemplateContentInput,
): CampaignFieldInput {
  const observacoes = [content.nomeProduto, content.destaque]
    .filter(Boolean)
    .join(" — ");

  return {
    titulo: content.titulo,
    subtitulo: content.subtitulo ?? "",
    texto: content.corpo,
    banner: content.bannerUrl ?? "",
    imagem: "",
    imagens: [],
    link: content.ctaUrl ?? "",
    botao: content.ctaTexto ?? "",
    preco: content.preco || content.precoOriginal || "",
    desconto: content.precoPromocional || "",
    validade: content.validade ?? "",
    observacoes,
  };
}

function resolvePrimaryChannel(channels: Channel[]): Channel | null {
  if (channels.length === 1) return channels[0]!;
  return null;
}

async function resolveRecipientContactIds(
  contactIds: string[],
  groupIds: string[],
): Promise<string[]> {
  const fromGroups = await findContactIdsByGroupIds(groupIds);
  return [...new Set([...contactIds, ...fromGroups])];
}

async function toCampaignDto(
  campaign: CampaignWithRelations,
): Promise<CampaignDto> {
  const resolvedRecipientContactIds = await resolveRecipientContactIds(
    campaign.recipientContactIds,
    campaign.recipientGroupIds,
  );

  return {
    id: campaign.id,
    nome: campaign.nome,
    type: campaign.type,
    status: campaign.status,
    channel: campaign.channel,
    channels: campaign.channels,
    templateId: campaign.templateId,
    creatorId: campaign.creatorId,
    scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
    sentAt: campaign.sentAt?.toISOString() ?? null,
    wizardStep: (campaign.wizardStep as WizardStep | null) ?? null,
    recipientContactIds: campaign.recipientContactIds,
    recipientGroupIds: campaign.recipientGroupIds,
    resolvedRecipientContactIds,
    publicSlug: campaign.publicSlug,
    field: fieldToDto(campaign.field),
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}

function wizardStateToCampaignData(
  state: CampaignWizardStateInput,
  options?: { status?: CampaignStatus; scheduledAt?: Date | null },
) {
  const channels = state.channels;
  return {
    nome: state.nome.trim(),
    type: state.type,
    status: options?.status ?? CampaignStatus.draft,
    channels,
    channel: resolvePrimaryChannel(channels),
    templateId: state.templateId || null,
    wizardStep: state.wizardStep,
    recipientContactIds: state.recipientContactIds,
    recipientGroupIds: state.recipientGroupIds,
    scheduledAt: options?.scheduledAt ?? null,
    field: fieldInputToData(state.field),
  };
}

export class CampaignService {
  async createDraft(nome: string, actorId: string): Promise<CampaignDto> {
    const parsed = campaignWizardStateSchema
      .pick({ nome: true })
      .safeParse({ nome });
    if (!parsed.success) {
      throw new CampaignValidationError(formatZodValidationError(parsed.error));
    }

    const campaign = await createCampaign({
      nome: parsed.data.nome,
      status: CampaignStatus.draft,
      creatorId: actorId,
      wizardStep: "criar",
      field: fieldInputToData(emptyFieldInputLocal()),
    });

    await auditLog({
      actorId,
      action: "campaign.created",
      entity: "Campaign",
      entityId: campaign.id,
      payload: { nome: campaign.nome },
    });

    return toCampaignDto(campaign);
  }

  async saveDraft(
    id: string,
    state: CampaignWizardStateInput,
    actorId: string,
  ): Promise<CampaignDto> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }
    if (existing.status !== CampaignStatus.draft) {
      throw new CampaignValidationError(
        "Apenas rascunhos podem ser editados desta forma",
      );
    }

    const parsed = this.parseWizardState(state);
    const campaign = await updateCampaign(
      id,
      wizardStateToCampaignData(parsed, { status: CampaignStatus.draft }),
    );

    await auditLog({
      actorId,
      action: "campaign.draft_saved",
      entity: "Campaign",
      entityId: campaign.id,
      payload: { wizardStep: parsed.wizardStep },
    });

    return toCampaignDto(campaign);
  }

  async advanceWizardStep(
    id: string,
    currentStep: WizardStep,
    stepData: Record<string, unknown>,
    actorId: string,
  ): Promise<{ campaign: CampaignDto; nextStep: WizardStep | null }> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }

    const validation = validateWizardStep(currentStep, stepData);
    if (!validation.success) {
      throw new CampaignWizardError(validation.error);
    }

    if (currentStep === "contatos") {
      const data = validation.data as { recipientContactIds: string[] };
      await this.validateRecipientReferences(data.recipientContactIds, []);
    }

    if (currentStep === "grupos") {
      const data = validation.data as {
        recipientContactIds: string[];
        recipientGroupIds: string[];
      };
      await this.validateRecipientReferences(
        data.recipientContactIds,
        data.recipientGroupIds,
      );
    }

    const currentState = await this.buildWizardState(existing);
    const mergedState = { ...currentState, ...stepData };
    const nextStep = getNextWizardStep(currentStep);

    if (currentStep === "template" && mergedState.templateId) {
      const template = await findTemplateById(mergedState.templateId);
      if (!template?.conteudo) {
        throw new CampaignValidationError("Template não encontrado");
      }
      let content: TemplateContentInput;
      try {
        content = templateContentSchema.parse(JSON.parse(template.conteudo));
      } catch {
        throw new CampaignValidationError("Conteúdo do template inválido");
      }
      mergedState.field = templateContentToCampaignField(content);
    }

    const parsed = this.parseWizardState({
      ...mergedState,
      wizardStep: nextStep ?? currentStep,
    });

    const campaign = await updateCampaign(
      id,
      wizardStateToCampaignData(parsed, { status: CampaignStatus.draft }),
    );

    await auditLog({
      actorId,
      action: "campaign.wizard_advanced",
      entity: "Campaign",
      entityId: campaign.id,
      payload: { from: currentStep, to: nextStep },
    });

    return {
      campaign: await toCampaignDto(campaign),
      nextStep,
    };
  }

  private parseFutureScheduledAt(scheduledAtIso: string): Date {
    const scheduledAt = new Date(scheduledAtIso);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new CampaignValidationError("Data de agendamento inválida");
    }

    if (scheduledAt.getTime() <= Date.now()) {
      throw new CampaignValidationError(
        "A data de agendamento deve ser no futuro",
      );
    }

    return scheduledAt;
  }

  async scheduleCampaign(
    id: string,
    scheduledAtIso: string,
    actorId: string,
  ): Promise<CampaignDto> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }

    if (existing.status !== CampaignStatus.draft) {
      throw new CampaignValidationError(
        "Apenas campanhas em rascunho podem ser agendadas",
      );
    }

    assertCampaignContentComplete(fieldToInput(fieldToDto(existing.field)));

    const scheduledAt = this.parseFutureScheduledAt(scheduledAtIso);

    const campaign = await updateCampaign(id, {
      status: CampaignStatus.scheduled,
      scheduledAt,
      wizardStep: "enviar",
    });

    await auditLog({
      actorId,
      action: "campaign.scheduled",
      entity: "Campaign",
      entityId: campaign.id,
      payload: { scheduledAt: scheduledAt.toISOString() },
    });

    return toCampaignDto(campaign);
  }

  async cancelScheduledCampaign(
    id: string,
    actorId: string,
  ): Promise<CampaignDto> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }

    if (existing.status !== CampaignStatus.scheduled) {
      throw new CampaignValidationError(
        "Apenas campanhas agendadas podem ser canceladas",
      );
    }

    const campaign = await updateCampaign(id, {
      status: CampaignStatus.draft,
      scheduledAt: null,
    });

    await auditLog({
      actorId,
      action: "campaign.schedule_cancelled",
      entity: "Campaign",
      entityId: campaign.id,
      payload: {
        previousScheduledAt: existing.scheduledAt?.toISOString() ?? null,
      },
    });

    return toCampaignDto(campaign);
  }

  async rescheduleCampaign(
    id: string,
    scheduledAtIso: string,
    actorId: string,
  ): Promise<CampaignDto> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }

    if (existing.status !== CampaignStatus.scheduled) {
      throw new CampaignValidationError(
        "Apenas campanhas agendadas podem ser reagendadas",
      );
    }

    const scheduledAt = this.parseFutureScheduledAt(scheduledAtIso);
    const previousScheduledAt = existing.scheduledAt?.toISOString() ?? null;

    const campaign = await updateCampaign(id, {
      status: CampaignStatus.scheduled,
      scheduledAt,
    });

    await auditLog({
      actorId,
      action: "campaign.rescheduled",
      entity: "Campaign",
      entityId: campaign.id,
      payload: {
        previousScheduledAt,
        scheduledAt: scheduledAt.toISOString(),
      },
    });

    return toCampaignDto(campaign);
  }

  async duplicateCampaign(id: string, actorId: string): Promise<CampaignDto> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }

    const campaign = await duplicateCampaignRecord(existing, actorId);

    await auditLog({
      actorId,
      action: "campaign.duplicated",
      entity: "Campaign",
      entityId: campaign.id,
      payload: { sourceId: id },
    });

    return toCampaignDto(campaign);
  }

  async resendCampaign(id: string, actorId: string): Promise<CampaignDto> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }
    if (existing.status !== CampaignStatus.sent) {
      throw new CampaignValidationError(
        "Somente campanhas enviadas podem ser reenviadas",
      );
    }

    const field = existing.field;
    const copy = await createCampaign({
      nome: existing.nome,
      type: existing.type,
      status: CampaignStatus.draft,
      channel: existing.channel,
      channels: [...existing.channels],
      templateId: existing.templateId,
      creatorId: actorId,
      wizardStep: existing.wizardStep,
      recipientContactIds: [...existing.recipientContactIds],
      recipientGroupIds: [...existing.recipientGroupIds],
      field: field
        ? {
            titulo: field.titulo,
            subtitulo: field.subtitulo,
            texto: field.texto,
            banner: field.banner,
            imagem: field.imagem,
            imagens: [...(field.imagens ?? [])],
            link: field.link,
            botao: field.botao,
            preco: field.preco,
            desconto: field.desconto,
            validade: field.validade,
            observacoes: field.observacoes,
          }
        : undefined,
    });

    await auditLog({
      actorId,
      action: "campaign.resent",
      entity: "Campaign",
      entityId: copy.id,
      payload: { sourceId: id },
    });

    return toCampaignDto(copy);
  }

  async getCampaignById(id: string): Promise<CampaignDto | null> {
    const campaign = await findCampaignById(id);
    return campaign ? toCampaignDto(campaign) : null;
  }

  async listCampaigns(
    filters: CampaignListFiltersInput,
  ): Promise<CampaignListResponse> {
    const parsed = campaignListFiltersSchema.parse(filters);
    const skip = (parsed.page - 1) * parsed.pageSize;

    const query: CampaignListQuery = {
      search: parsed.search,
      status: parsed.status,
      type: parsed.type,
      skip,
      take: parsed.pageSize,
    };

    const result: CampaignListResult = await listCampaigns(query);

    return {
      items: await Promise.all(result.items.map(toCampaignDto)),
      total: result.total,
      page: parsed.page,
      pageSize: parsed.pageSize,
    };
  }

  async deleteCampaign(id: string, actorId: string): Promise<void> {
    const existing = await findCampaignById(id);
    if (!existing) {
      throw new CampaignValidationError("Campanha não encontrada");
    }

    await deleteCampaign(id);

    await auditLog({
      actorId,
      action: "campaign.deleted",
      entity: "Campaign",
      entityId: id,
      payload: { nome: existing.nome },
    });
  }

  async resolveRecipients(
    contactIds: string[],
    groupIds: string[],
  ): Promise<string[]> {
    return resolveRecipientContactIds(contactIds, groupIds);
  }

  async getRecipientContacts(contactIds: string[]) {
    const contacts = await findContactsByIds(contactIds);
    return contacts.map((contact) => ({
      id: contact.id,
      nome: contact.nome,
      empresa: contact.empresa,
      email: contact.email,
      telefone: contact.telefone,
    }));
  }

  async buildWizardState(
    campaign: CampaignWithRelations,
  ): Promise<CampaignWizardStateInput> {
    return {
      nome: campaign.nome,
      type: campaign.type,
      templateId: campaign.templateId ?? "",
      field: fieldToInput(fieldToDto(campaign.field)),
      recipientContactIds: campaign.recipientContactIds,
      recipientGroupIds: campaign.recipientGroupIds,
      channels: campaign.channels,
      wizardStep: (campaign.wizardStep as WizardStep) ?? "criar",
      scheduledAt: campaign.scheduledAt?.toISOString() ?? "",
    };
  }

  /**
   * Busca campanha para a landing page pública. Sem autenticação: retorna
   * apenas conteúdo da campanha (nunca autor/destinatários) e somente se a
   * campanha já foi enviada.
   */
  async getPublicCampaignBySlug(
    slug: string,
  ): Promise<PublicCampaignDto | null> {
    const parsed = publicSlugSchema.safeParse(slug);
    if (!parsed.success) return null;

    const campaign = await findCampaignByPublicSlug(parsed.data);
    if (!campaign) return null;

    const field = fieldToDto(campaign.field);
    if (!field) return null;

    return {
      type: campaign.type,
      sentAt: campaign.sentAt?.toISOString() ?? null,
      field,
    };
  }

  validateFieldContent(input: CampaignFieldInput): CampaignFieldInput {
    const result = campaignFieldSchema.safeParse(input);
    if (!result.success) {
      throw new CampaignValidationError(formatZodValidationError(result.error));
    }
    return result.data;
  }

  private parseWizardState(
    input: CampaignWizardStateInput,
  ): CampaignWizardStateInput {
    const result = campaignWizardStateSchema.safeParse(input);
    if (!result.success) {
      throw new CampaignValidationError(formatZodValidationError(result.error));
    }
    return result.data;
  }

  private async validateRecipientReferences(
    contactIds: string[],
    groupIds: string[],
  ): Promise<void> {
    const uniqueContactIds = [...new Set(contactIds)];
    const uniqueGroupIds = [...new Set(groupIds)];

    const [contacts, existingGroupIds] = await Promise.all([
      uniqueContactIds.length > 0
        ? findContactsByIds(uniqueContactIds)
        : Promise.resolve([]),
      findExistingGroupIds(uniqueGroupIds),
    ]);

    if (contacts.length !== uniqueContactIds.length) {
      throw new CampaignWizardError(
        "Um ou mais contatos selecionados não existem",
      );
    }

    if (uniqueGroupIds.some((id) => !existingGroupIds.has(id))) {
      throw new CampaignWizardError(
        "Um ou mais grupos selecionados não existem",
      );
    }
  }
}

let defaultCampaignService: CampaignService | null = null;

export function getCampaignService(): CampaignService {
  if (!defaultCampaignService) {
    defaultCampaignService = new CampaignService();
  }
  return defaultCampaignService;
}

export function setCampaignServiceForTests(
  service: CampaignService | null,
): void {
  defaultCampaignService = service;
}

export {
  fieldInputToData,
  fieldToInput,
  resolveRecipientContactIds,
  toCampaignDto,
};
