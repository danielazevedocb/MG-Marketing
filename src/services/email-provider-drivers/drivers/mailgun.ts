import { ProviderType } from "@/generated/prisma/enums";

import {
  CONNECTION_FAILURE_MESSAGE,
  CONNECTION_SUCCESS_MESSAGE,
  SEND_EMAIL_FAILURE_MESSAGE,
  SEND_EMAIL_SUCCESS_MESSAGE,
  type ConnectionTestResult,
  type EmailProviderDriver,
  type EmailProviderDriverContext,
  type SendEmailInput,
  type SendEmailResult,
  isMailgunCredentials,
} from "../types";

export class MailgunDriver implements EmailProviderDriver {
  readonly type = ProviderType.Mailgun;

  async testConnection(
    context: EmailProviderDriverContext,
  ): Promise<ConnectionTestResult> {
    if (!isMailgunCredentials(context.credentials)) {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }

    const { apiKey, domain } = context.credentials;
    const auth = Buffer.from(`api:${apiKey}`).toString("base64");

    try {
      const response = await fetch(
        `https://api.mailgun.net/v3/domains/${encodeURIComponent(domain)}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      if (response.ok) {
        return { success: true, message: CONNECTION_SUCCESS_MESSAGE };
      }

      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    } catch {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }
  }

  async sendEmail(
    context: EmailProviderDriverContext,
    input: SendEmailInput,
  ): Promise<SendEmailResult> {
    if (!isMailgunCredentials(context.credentials)) {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }

    const { apiKey, domain } = context.credentials;
    const auth = Buffer.from(`api:${apiKey}`).toString("base64");

    try {
      const body = new URLSearchParams({
        from: `${context.fromName} <${context.fromEmail}>`,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });

      const response = await fetch(
        `https://api.mailgun.net/v3/${encodeURIComponent(domain)}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        },
      );

      if (!response.ok) {
        return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
      }

      const payload = (await response.json()) as { id?: string };
      return {
        success: true,
        message: SEND_EMAIL_SUCCESS_MESSAGE,
        messageId: payload.id,
      };
    } catch {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }
  }
}
