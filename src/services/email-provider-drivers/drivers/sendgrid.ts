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
  isSendGridCredentials,
} from "../types";

export class SendGridDriver implements EmailProviderDriver {
  readonly type = ProviderType.SendGrid;

  async testConnection(
    context: EmailProviderDriverContext,
  ): Promise<ConnectionTestResult> {
    if (!isSendGridCredentials(context.credentials)) {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }

    try {
      const response = await fetch("https://api.sendgrid.com/v3/user/profile", {
        headers: {
          Authorization: `Bearer ${context.credentials.apiKey}`,
        },
      });

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
    if (!isSendGridCredentials(context.credentials)) {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.credentials.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: input.to }] }],
          from: { email: context.fromEmail, name: context.fromName },
          subject: input.subject,
          content: [{ type: "text/html", value: input.html }],
        }),
      });

      if (!response.ok) {
        return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
      }

      const messageId = response.headers.get("x-message-id") ?? undefined;
      return {
        success: true,
        message: SEND_EMAIL_SUCCESS_MESSAGE,
        messageId,
      };
    } catch {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }
  }
}
