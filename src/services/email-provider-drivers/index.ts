import { ProviderType } from "@/generated/prisma/enums";

import { MailgunDriver } from "./drivers/mailgun";
import { PostmarkDriver } from "./drivers/postmark";
import { ResendDriver } from "./drivers/resend";
import { SendGridDriver } from "./drivers/sendgrid";
import { SesDriver } from "./drivers/ses";
import { SmtpDriver } from "./drivers/smtp";
import type {
  ConnectionTestResult,
  EmailProviderDriver,
  EmailProviderDriverContext,
  SendEmailInput,
  SendEmailResult,
} from "./types";

const drivers: Record<ProviderType, EmailProviderDriver> = {
  [ProviderType.SMTP]: new SmtpDriver(),
  [ProviderType.Resend]: new ResendDriver(),
  [ProviderType.SendGrid]: new SendGridDriver(),
  [ProviderType.SES]: new SesDriver(),
  [ProviderType.Mailgun]: new MailgunDriver(),
  [ProviderType.Postmark]: new PostmarkDriver(),
};

export function getEmailProviderDriver(
  type: ProviderType,
): EmailProviderDriver {
  return drivers[type];
}

export async function testProviderConnection(
  type: ProviderType,
  context: EmailProviderDriverContext,
): Promise<ConnectionTestResult> {
  return getEmailProviderDriver(type).testConnection(context);
}

export async function sendProviderEmail(
  type: ProviderType,
  context: EmailProviderDriverContext,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  return getEmailProviderDriver(type).sendEmail(context, input);
}

export type {
  ConnectionTestResult,
  EmailProviderDriverContext,
  SendEmailInput,
  SendEmailResult,
};
