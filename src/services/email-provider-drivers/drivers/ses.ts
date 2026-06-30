import { GetAccountSendingEnabledCommand, SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

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
  isSesCredentials,
} from "../types";

export class SesDriver implements EmailProviderDriver {
  readonly type = ProviderType.SES;

  async testConnection(
    context: EmailProviderDriverContext,
  ): Promise<ConnectionTestResult> {
    if (!isSesCredentials(context.credentials)) {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }

    const { accessKeyId, secretAccessKey, region } = context.credentials;

    try {
      const client = new SESClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      await client.send(new GetAccountSendingEnabledCommand({}));
      return { success: true, message: CONNECTION_SUCCESS_MESSAGE };
    } catch {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }
  }

  async sendEmail(
    context: EmailProviderDriverContext,
    input: SendEmailInput,
  ): Promise<SendEmailResult> {
    if (!isSesCredentials(context.credentials)) {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }

    const { accessKeyId, secretAccessKey, region } = context.credentials;

    try {
      const client = new SESClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      const result = await client.send(
        new SendEmailCommand({
          Source: `"${context.fromName}" <${context.fromEmail}>`,
          Destination: { ToAddresses: [input.to] },
          Message: {
            Subject: { Data: input.subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: input.html, Charset: "UTF-8" },
            },
          },
        }),
      );

      return {
        success: true,
        message: SEND_EMAIL_SUCCESS_MESSAGE,
        messageId: result.MessageId,
      };
    } catch {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }
  }
}
