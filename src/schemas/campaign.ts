// Schemas Zod de campanhas — wizard, conteúdo e validação compartilhada.
import { z, type ZodError } from "zod";

import {
  CampaignStatus,
  CampaignType,
  Channel,
} from "@/generated/prisma/enums";
import { normalizeOptionalString } from "@/schemas/contact";
import { entityIdArraySchema } from "@/schemas/id";

const optionalUrl = z
  .string()
  .trim()
  .url("URL inválida")
  .optional()
  .or(z.literal(""));

function optionalShortText(max: number, label: string) {
  return z
    .string()
    .trim()
    .max(max, `${label} muito longo`)
    .optional()
    .or(z.literal(""));
}

/// Valor monetário ou percentual (formato livre, mas deve ser numérico válido).
const optionalNumericField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => {
      if (!value) return true;
      const normalized = value.replace(/\./g, "").replace(",", ".");
      return !Number.isNaN(Number(normalized)) && Number(normalized) >= 0;
    },
    { message: "Informe um valor numérico válido" },
  );

export const WIZARD_STEPS = [
  "criar",
  "tipo",
  "template",
  "conteudo",
  "imagem",
  "contatos",
  "grupos",
  "canal",
  "preview",
  "enviar",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const campaignTypeSchema = z.nativeEnum(CampaignType);
export const campaignStatusSchema = z.nativeEnum(CampaignStatus);
export const channelSchema = z.nativeEnum(Channel);

export const campaignFieldSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo"),
  subtitulo: optionalShortText(300, "Subtítulo"),
  texto: z
    .string()
    .trim()
    .min(1, "Texto é obrigatório")
    .max(5000, "Texto muito longo"),
  banner: optionalUrl,
  imagem: optionalUrl,
  link: optionalUrl,
  botao: optionalShortText(80, "Texto do botão"),
  preco: optionalNumericField,
  desconto: optionalNumericField,
  validade: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !Number.isNaN(date.getTime());
      },
      { message: "Data de validade inválida" },
    ),
  observacoes: optionalShortText(2000, "Observações"),
});

export type CampaignFieldInput = z.infer<typeof campaignFieldSchema>;

/** Conteúdo parcial permitido enquanto o wizard ainda não passou pela etapa de conteúdo. */
export const campaignFieldDraftSchema = campaignFieldSchema.extend({
  titulo: optionalShortText(200, "Título"),
  texto: z
    .string()
    .trim()
    .max(5000, "Texto muito longo")
    .optional()
    .or(z.literal("")),
});

export type CampaignFieldDraftInput = z.infer<typeof campaignFieldDraftSchema>;

export const campaignWizardStateSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome da campanha é obrigatório")
    .max(120, "Nome muito longo"),
  type: campaignTypeSchema,
  templateId: z.string().cuid().optional().or(z.literal("")),
  field: campaignFieldDraftSchema,
  recipientContactIds: entityIdArraySchema("Contato"),
  recipientGroupIds: entityIdArraySchema("Grupo"),
  channels: z.array(channelSchema),
  wizardStep: z.enum(WIZARD_STEPS),
  scheduledAt: z.string().datetime().optional().or(z.literal("")),
});

export type CampaignWizardStateInput = z.infer<typeof campaignWizardStateSchema>;

export const campaignCreateStepSchema = z.object({
  nome: campaignWizardStateSchema.shape.nome,
});

export const campaignTypeStepSchema = z.object({
  type: campaignTypeSchema,
});

export const campaignTemplateStepSchema = z.object({
  templateId: z.string().cuid("Selecione um template"),
});

export const campaignContentStepSchema = z.object({
  field: campaignFieldSchema,
});

export const campaignImageStepSchema = z.object({
  field: campaignFieldSchema.pick({ banner: true, imagem: true }),
});

export const campaignContactsStepSchema = z.object({
  recipientContactIds: entityIdArraySchema("Contato").default([]),
});

export const campaignGroupsStepSchema = z
  .object({
    recipientGroupIds: entityIdArraySchema("Grupo").default([]),
    recipientContactIds: entityIdArraySchema("Contato").default([]),
  })
  .refine(
    (data) =>
      data.recipientContactIds.length > 0 || data.recipientGroupIds.length > 0,
    {
      message: "Selecione ao menos um contato ou grupo",
      path: ["recipientGroupIds"],
    },
  );

export const campaignChannelStepSchema = z.object({
  channels: z.array(channelSchema).min(1, "Selecione ao menos um canal"),
});

export const campaignScheduleStepSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ message: "Data de agendamento inválida" })
    .optional()
    .or(z.literal("")),
});

/** Valida data/hora de agendamento futura (entrada em ISO UTC). */
export function parseFutureScheduledAt(
  scheduledAtIso: string,
): { success: true; date: Date } | { success: false; error: string } {
  const scheduledAt = new Date(scheduledAtIso);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { success: false, error: "Data de agendamento inválida" };
  }

  if (scheduledAt.getTime() <= Date.now()) {
    return {
      success: false,
      error: "A data de agendamento deve ser no futuro",
    };
  }

  return { success: true, date: scheduledAt };
}

export const campaignListFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: campaignStatusSchema.optional(),
  type: campaignTypeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CampaignListFiltersInput = z.infer<typeof campaignListFiltersSchema>;

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  [CampaignType.Novidade]: "Novidade",
  [CampaignType.Promocao]: "Promoção",
  [CampaignType.Produto]: "Produto",
  [CampaignType.Geral]: "Geral",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.draft]: "Rascunho",
  [CampaignStatus.scheduled]: "Agendada",
  [CampaignStatus.sent]: "Enviada",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  [Channel.WhatsApp]: "WhatsApp",
  [Channel.Email]: "Email",
};

const STEP_SCHEMAS: Record<WizardStep, z.ZodType> = {
  criar: campaignCreateStepSchema,
  tipo: campaignTypeStepSchema,
  template: campaignTemplateStepSchema,
  conteudo: campaignContentStepSchema,
  imagem: campaignImageStepSchema,
  contatos: campaignContactsStepSchema,
  grupos: campaignGroupsStepSchema,
  canal: campaignChannelStepSchema,
  preview: z.object({}),
  enviar: campaignScheduleStepSchema,
};

export function getNextWizardStep(step: WizardStep): WizardStep | null {
  const index = WIZARD_STEPS.indexOf(step);
  if (index < 0 || index >= WIZARD_STEPS.length - 1) return null;
  return WIZARD_STEPS[index + 1]!;
}

export function getPreviousWizardStep(step: WizardStep): WizardStep | null {
  const index = WIZARD_STEPS.indexOf(step);
  if (index <= 0) return null;
  return WIZARD_STEPS[index - 1]!;
}

const WIZARD_FIELD_LABELS: Record<string, string> = {
  recipientContactIds: "contatos",
  recipientGroupIds: "grupos",
  channels: "canais",
  templateId: "template",
  nome: "nome da campanha",
  type: "tipo",
  field: "conteúdo",
  scheduledAt: "data de agendamento",
};

/** Converte erros genéricos do Zod em mensagens claras em português. */
export function formatZodValidationError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Dados inválidos";

  const message = issue.message;
  const fieldKey = String(issue.path[0] ?? "");
  const fieldLabel = WIZARD_FIELD_LABELS[fieldKey];

  // Mensagens já customizadas em pt-BR nos schemas têm prioridade. As mensagens
  // genéricas do Zod ("Invalid input"/"Invalid input: ...") são traduzidas abaixo
  // com base no código do problema (issue.code), não no texto em inglês.
  const isGenericMessage =
    !message || message === "Invalid input" || message.startsWith("Invalid input");

  if (!isGenericMessage) {
    return message;
  }

  // Tipo inesperado (ex.: seleção de destinatários ausente ou em formato inválido).
  if (issue.code === "invalid_type") {
    if (fieldLabel) {
      return `Informe a seleção de ${fieldLabel} antes de avançar`;
    }
    return "Seleção de destinatários inválida";
  }

  if (fieldLabel) {
    return `Verifique o campo ${fieldLabel} e tente novamente`;
  }
  return "Dados inválidos; verifique os campos e tente novamente";
}

export function validateWizardStep(
  step: WizardStep,
  data: Record<string, unknown>,
): { success: true; data: unknown } | { success: false; error: string } {
  const schema = STEP_SCHEMAS[step];
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: formatZodValidationError(result.error),
    };
  }
  return { success: true, data: result.data };
}

export { normalizeOptionalString };

export function emptyFieldInput(): CampaignFieldInput {
  return {
    titulo: "",
    subtitulo: "",
    texto: "",
    banner: "",
    imagem: "",
    link: "",
    botao: "",
    preco: "",
    desconto: "",
    validade: "",
    observacoes: "",
  };
}
