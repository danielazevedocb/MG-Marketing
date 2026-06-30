// Serviço de envio de email — usa o provedor ativo e HTML gerado automaticamente.
import type { ProviderType } from "@/generated/prisma/enums";
import { NoActiveEmailProviderError } from "@/lib/sending-errors";
import { findActiveEmailProvider } from "@/repositories/email-provider";
import type { CampaignFieldInput } from "@/schemas/campaign";
import { gerarHtmlEmail } from "@/services/channel-content";
import {
  sendProviderEmail,
  type EmailProviderDriverContext,
  type SendEmailResult,
} from "@/services/email-provider-drivers";
import { __testables as emailProviderTestables } from "@/services/email-providers";

export type EmailSendInput = {
  to: string;
  subject: string;
  content: CampaignFieldInput;
};

export type ActiveEmailProviderContext = EmailProviderDriverContext & {
  provider: ProviderType;
};

export async function getActiveEmailProviderContext(): Promise<ActiveEmailProviderContext | null> {
  const record = await findActiveEmailProvider();
  if (!record?.credentialsEncrypted) {
    return null;
  }

  const credentials = emailProviderTestables.parseCredentials(
    record.provider,
    record.credentialsEncrypted,
  );

  return {
    provider: record.provider,
    fromName: record.fromName ?? "",
    fromEmail: record.fromEmail ?? "",
    credentials,
  };
}

export async function sendCampaignEmail(
  input: EmailSendInput,
  providerContext?: ActiveEmailProviderContext | null,
): Promise<SendEmailResult> {
  const context = providerContext ?? (await getActiveEmailProviderContext());

  if (!context) {
    throw new NoActiveEmailProviderError();
  }

  const html = gerarHtmlEmail(input.content);

  return sendProviderEmail(context.provider, context, {
    to: input.to,
    subject: input.subject,
    html,
  });
}
