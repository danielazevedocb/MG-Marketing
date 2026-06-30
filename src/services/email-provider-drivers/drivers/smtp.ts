import nodemailer from "nodemailer";

import { ProviderType } from "@/generated/prisma/enums";
import type { SmtpCredentialsInput } from "@/schemas/email-provider";

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
  isSmtpCredentials,
} from "../types";

export class SmtpDriver implements EmailProviderDriver {
  readonly type = ProviderType.SMTP;

  async testConnection(
    context: EmailProviderDriverContext,
  ): Promise<ConnectionTestResult> {
    if (!isSmtpCredentials(context.credentials)) {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }

    const credentials = context.credentials as SmtpCredentialsInput;

    try {
      const transporter = nodemailer.createTransport({
        host: credentials.host,
        port: credentials.port,
        secure: credentials.secure,
        auth: {
          user: credentials.user,
          pass: credentials.password,
        },
      });

      await transporter.verify();
      return { success: true, message: CONNECTION_SUCCESS_MESSAGE };
    } catch {
      return { success: false, message: CONNECTION_FAILURE_MESSAGE };
    }
  }

  async sendEmail(
    context: EmailProviderDriverContext,
    input: SendEmailInput,
  ): Promise<SendEmailResult> {
    if (!isSmtpCredentials(context.credentials)) {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }

    const credentials = context.credentials as SmtpCredentialsInput;

    try {
      const transporter = nodemailer.createTransport({
        host: credentials.host,
        port: credentials.port,
        secure: credentials.secure,
        auth: {
          user: credentials.user,
          pass: credentials.password,
        },
      });

      const info = await transporter.sendMail({
        from: `"${context.fromName}" <${context.fromEmail}>`,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });

      return {
        success: true,
        message: SEND_EMAIL_SUCCESS_MESSAGE,
        messageId: info.messageId,
      };
    } catch {
      return { success: false, message: SEND_EMAIL_FAILURE_MESSAGE };
    }
  }
}
