// Schema Zod da configuração de WhatsApp — validação compartilhada entre
// formulário e servidor.
import { z } from "zod";

import { normalizarTelefoneWhatsApp } from "@/services/channel-content";

export const whatsappConfigUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Informe o nome de exibição.")
    .max(120, "Nome de exibição muito longo."),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Informe o telefone.")
    .max(30, "Telefone muito longo.")
    .refine(
      (value) => normalizarTelefoneWhatsApp(value).valid,
      "Telefone inválido — use DDD + número.",
    ),
  signature: z
    .string()
    .trim()
    .max(200, "Assinatura muito longa.")
    .optional()
    .or(z.literal("")),
});

export type WhatsAppConfigUpdateInput = z.infer<
  typeof whatsappConfigUpdateSchema
>;
