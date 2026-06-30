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
  isResendCredentials,
} from "../types";

export class ResendDriver implements EmailProviderDriver {
  readonly type = ProviderType.Resend;

  async testConnection(
    context: EmailProviderDriverContext,
  ): Promise<ConnectionTestResult> {
    if (!isResendCredentials(context.credentials)) {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }

    try {
      const response = await fetch("https://api.resend.com/domains", {
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
    if (!isResendCredentials(context.credentials)) {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.credentials.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${context.fromName} <${context.fromEmail}>`,
          to: [input.to],
          subject: input.subject,
          html: input.html,
        }),
      });

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
