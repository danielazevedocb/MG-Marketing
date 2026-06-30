import type { ProviderType } from "@/generated/prisma/enums";
import type {
  MailgunCredentialsInput,
  PostmarkCredentialsInput,
  ProviderCredentialsInput,
  ResendCredentialsInput,
  SendGridCredentialsInput,
  SesCredentialsInput,
  SmtpCredentialsInput,
} from "@/schemas/email-provider";

export type ConnectionTestResult = {
  success: boolean;
  message: string;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = {
  success: boolean;
  message: string;
  messageId?: string;
};

export type EmailProviderDriverContext = {
  fromName: string;
  fromEmail: string;
  credentials: ProviderCredentialsInput;
};

export interface EmailProviderDriver {
  readonly type: ProviderType;
  testConnection(context: EmailProviderDriverContext): Promise<ConnectionTestResult>;
  sendEmail(
    context: EmailProviderDriverContext,
    input: SendEmailInput,
  ): Promise<SendEmailResult>;
}

export const SEND_EMAIL_FAILURE_MESSAGE =
  "Não foi possível enviar o email. Tente novamente ou revise o provedor.";
export const SEND_EMAIL_SUCCESS_MESSAGE = "Email enviado com sucesso.";

export function isSmtpCredentials(
  credentials: ProviderCredentialsInput,
): credentials is SmtpCredentialsInput {
  return "host" in credentials && "port" in credentials;
}

export function isResendCredentials(
  credentials: ProviderCredentialsInput,
): credentials is ResendCredentialsInput {
  return "apiKey" in credentials && !("domain" in credentials) && !("host" in credentials);
}

export function isSendGridCredentials(
  credentials: ProviderCredentialsInput,
): credentials is SendGridCredentialsInput {
  return "apiKey" in credentials && !("domain" in credentials) && !("host" in credentials);
}

export function isSesCredentials(
  credentials: ProviderCredentialsInput,
): credentials is SesCredentialsInput {
  return "accessKeyId" in credentials && "secretAccessKey" in credentials;
}

export function isMailgunCredentials(
  credentials: ProviderCredentialsInput,
): credentials is MailgunCredentialsInput {
  return "apiKey" in credentials && "domain" in credentials;
}

export function isPostmarkCredentials(
  credentials: ProviderCredentialsInput,
): credentials is PostmarkCredentialsInput {
  return "serverToken" in credentials;
}

export const CONNECTION_SUCCESS_MESSAGE = "Conexão verificada com sucesso.";
export const CONNECTION_FAILURE_MESSAGE =
  "Não foi possível verificar a conexão. Revise as credenciais e tente novamente.";
