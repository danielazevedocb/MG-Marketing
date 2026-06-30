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
  isPostmarkCredentials,
} from "../types";

export class PostmarkDriver implements EmailProviderDriver {
  readonly type = ProviderType.Postmark;

  async testConnection(
    context: EmailProviderDriverContext,
  ): Promise<ConnectionTestResult> {
    if (!isPostmarkCredentials(context.credentials)) {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }

    try {
      const response = await fetch("https://api.postmarkapp.com/server", {
        headers: {
          Accept: "application/json",
          "X-Postmark-Server-Token": context.credentials.serverToken,
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
    if (!isPostmarkCredentials(context.credentials)) {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }

    try {
      const response = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": context.credentials.serverToken,
        },
        body: JSON.stringify({
          From: `${context.fromName} <${context.fromEmail}>`,
          To: input.to,
          Subject: input.subject,
          HtmlBody: input.html,
        }),
      });

      if (!response.ok) {
        return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
      }

      const payload = (await response.json()) as { MessageID?: string };
      return {
        success: true,
        message: SEND_EMAIL_SUCCESS_MESSAGE,
        messageId: payload.MessageID,
      };
    } catch {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }
  }
}
