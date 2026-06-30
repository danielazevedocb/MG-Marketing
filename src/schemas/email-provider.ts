import { z } from "zod";

import { ProviderType } from "@/generated/prisma/enums";

const emailField = z
  .string()
  .trim()
  .min(1, "Informe o email do remetente.")
  .email("Email do remetente inválido.");

const nameField = z
  .string()
  .trim()
  .min(1, "Informe o nome do remetente.")
  .max(120, "Nome do remetente muito longo.");

const providerNameField = z
  .string()
  .trim()
  .min(1, "Informe um nome para o provedor.")
  .max(120, "Nome do provedor muito longo.");

export const smtpCredentialsSchema = z.object({
  host: z.string().trim().min(1, "Informe o host SMTP."),
  port: z.coerce
    .number()
    .int("Porta deve ser um número inteiro.")
    .min(1, "Porta inválida.")
    .max(65535, "Porta inválida."),
  user: z.string().trim().min(1, "Informe o usuário SMTP."),
  password: z.string().min(1, "Informe a senha SMTP."),
  secure: z.boolean(),
});

export const resendCredentialsSchema = z.object({
  apiKey: z.string().trim().min(1, "Informe a API key da Resend."),
});

export const sendGridCredentialsSchema = z.object({
  apiKey: z.string().trim().min(1, "Informe a API key do SendGrid."),
});

export const sesCredentialsSchema = z.object({
  accessKeyId: z.string().trim().min(1, "Informe o Access Key ID."),
  secretAccessKey: z
    .string()
    .trim()
    .min(1, "Informe o Secret Access Key."),
  region: z.string().trim().min(1, "Informe a região AWS."),
});

export const mailgunCredentialsSchema = z.object({
  apiKey: z.string().trim().min(1, "Informe a API key do Mailgun."),
  domain: z.string().trim().min(1, "Informe o domínio do Mailgun."),
});

export const postmarkCredentialsSchema = z.object({
  serverToken: z
    .string()
    .trim()
    .min(1, "Informe o Server Token do Postmark."),
});

const smtpProviderSchema = z.object({
  provider: z.literal(ProviderType.SMTP),
  name: providerNameField,
  fromName: nameField,
  fromEmail: emailField,
  credentials: smtpCredentialsSchema,
});

const resendProviderSchema = z.object({
  provider: z.literal(ProviderType.Resend),
  name: providerNameField,
  fromName: nameField,
  fromEmail: emailField,
  credentials: resendCredentialsSchema,
});

const sendGridProviderSchema = z.object({
  provider: z.literal(ProviderType.SendGrid),
  name: providerNameField,
  fromName: nameField,
  fromEmail: emailField,
  credentials: sendGridCredentialsSchema,
});

const sesProviderSchema = z.object({
  provider: z.literal(ProviderType.SES),
  name: providerNameField,
  fromName: nameField,
  fromEmail: emailField,
  credentials: sesCredentialsSchema,
});

const mailgunProviderSchema = z.object({
  provider: z.literal(ProviderType.Mailgun),
  name: providerNameField,
  fromName: nameField,
  fromEmail: emailField,
  credentials: mailgunCredentialsSchema,
});

const postmarkProviderSchema = z.object({
  provider: z.literal(ProviderType.Postmark),
  name: providerNameField,
  fromName: nameField,
  fromEmail: emailField,
  credentials: postmarkCredentialsSchema,
});

export const emailProviderCreateSchema = z.discriminatedUnion("provider", [
  smtpProviderSchema,
  resendProviderSchema,
  sendGridProviderSchema,
  sesProviderSchema,
  mailgunProviderSchema,
  postmarkProviderSchema,
]);

const smtpUpdateCredentialsSchema = smtpCredentialsSchema.partial({
  password: true,
});

const resendUpdateCredentialsSchema = resendCredentialsSchema.partial({
  apiKey: true,
});

const sendGridUpdateCredentialsSchema = sendGridCredentialsSchema.partial({
  apiKey: true,
});

const sesUpdateCredentialsSchema = sesCredentialsSchema.partial({
  secretAccessKey: true,
});

const mailgunUpdateCredentialsSchema = mailgunCredentialsSchema.partial({
  apiKey: true,
});

const postmarkUpdateCredentialsSchema = postmarkCredentialsSchema.partial({
  serverToken: true,
});

const smtpProviderUpdateSchema = z.object({
  provider: z.literal(ProviderType.SMTP),
  name: providerNameField.optional(),
  fromName: nameField.optional(),
  fromEmail: emailField.optional(),
  credentials: smtpUpdateCredentialsSchema.optional(),
});

const resendProviderUpdateSchema = z.object({
  provider: z.literal(ProviderType.Resend),
  name: providerNameField.optional(),
  fromName: nameField.optional(),
  fromEmail: emailField.optional(),
  credentials: resendUpdateCredentialsSchema.optional(),
});

const sendGridProviderUpdateSchema = z.object({
  provider: z.literal(ProviderType.SendGrid),
  name: providerNameField.optional(),
  fromName: nameField.optional(),
  fromEmail: emailField.optional(),
  credentials: sendGridUpdateCredentialsSchema.optional(),
});

const sesProviderUpdateSchema = z.object({
  provider: z.literal(ProviderType.SES),
  name: providerNameField.optional(),
  fromName: nameField.optional(),
  fromEmail: emailField.optional(),
  credentials: sesUpdateCredentialsSchema.optional(),
});

const mailgunProviderUpdateSchema = z.object({
  provider: z.literal(ProviderType.Mailgun),
  name: providerNameField.optional(),
  fromName: nameField.optional(),
  fromEmail: emailField.optional(),
  credentials: mailgunUpdateCredentialsSchema.optional(),
});

const postmarkProviderUpdateSchema = z.object({
  provider: z.literal(ProviderType.Postmark),
  name: providerNameField.optional(),
  fromName: nameField.optional(),
  fromEmail: emailField.optional(),
  credentials: postmarkUpdateCredentialsSchema.optional(),
});

export const emailProviderUpdateSchema = z.discriminatedUnion("provider", [
  smtpProviderUpdateSchema,
  resendProviderUpdateSchema,
  sendGridProviderUpdateSchema,
  sesProviderUpdateSchema,
  mailgunProviderUpdateSchema,
  postmarkProviderUpdateSchema,
]);

export const emailProviderTestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("saved"),
    providerId: z.string().min(1, "Informe o provedor."),
  }),
  z.object({
    mode: z.literal("inline"),
    config: emailProviderCreateSchema,
  }),
]);

export type EmailProviderCreateInput = z.infer<typeof emailProviderCreateSchema>;
export type EmailProviderUpdateInput = z.infer<typeof emailProviderUpdateSchema>;
export type EmailProviderTestInput = z.infer<typeof emailProviderTestSchema>;

export type SmtpCredentialsInput = z.infer<typeof smtpCredentialsSchema>;
export type ResendCredentialsInput = z.infer<typeof resendCredentialsSchema>;
export type SendGridCredentialsInput = z.infer<typeof sendGridCredentialsSchema>;
export type SesCredentialsInput = z.infer<typeof sesCredentialsSchema>;
export type MailgunCredentialsInput = z.infer<typeof mailgunCredentialsSchema>;
export type PostmarkCredentialsInput = z.infer<typeof postmarkCredentialsSchema>;

export type ProviderCredentialsInput =
  | SmtpCredentialsInput
  | ResendCredentialsInput
  | SendGridCredentialsInput
  | SesCredentialsInput
  | MailgunCredentialsInput
  | PostmarkCredentialsInput;
