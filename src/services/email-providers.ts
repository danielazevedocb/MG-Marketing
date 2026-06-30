// Serviço de provedores de email — regras de negócio, criptografia e teste de conexão.
import { ZodError } from "zod";

import type { EmailProvider } from "@/generated/prisma/client";
import { ProviderType } from "@/generated/prisma/enums";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  EmailProviderNotFoundError,
  EmailProviderValidationError,
} from "@/lib/email-provider-errors";
import {
  createEmailProvider,
  deleteEmailProvider,
  findEmailProviderById,
  listEmailProviders,
  setActiveEmailProvider,
  updateEmailProvider,
} from "@/repositories/email-provider";
import {
  emailProviderCreateSchema,
  emailProviderTestSchema,
  emailProviderUpdateSchema,
  type EmailProviderCreateInput,
  type EmailProviderTestInput,
  type EmailProviderUpdateInput,
  type ProviderCredentialsInput,
} from "@/schemas/email-provider";
import { auditLog } from "@/services/audit-log";
import { testProviderConnection } from "@/services/email-provider-drivers";

export type EmailProviderCredentialsMeta = {
  hasCredentials: boolean;
  host?: string;
  port?: number;
  user?: string;
  secure?: boolean;
  region?: string;
  domain?: string;
};

export type EmailProviderDto = {
  id: string;
  name: string;
  provider: ProviderType;
  active: boolean;
  fromName: string;
  fromEmail: string;
  credentialsMeta: EmailProviderCredentialsMeta;
  createdAt: string;
  updatedAt: string;
};

export type ConnectionTestResponse = {
  success: boolean;
  message: string;
};

function formatZodError(error: ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}

function parseCredentials(
  provider: ProviderType,
  raw: string | null,
): ProviderCredentialsInput {
  if (!raw) {
    throw new EmailProviderValidationError("Credenciais do provedor ausentes.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decrypt(raw));
  } catch {
    throw new EmailProviderValidationError("Credenciais do provedor inválidas.");
  }

  const result = emailProviderCreateSchema.safeParse({
    provider,
    name: "placeholder",
    fromName: "placeholder",
    fromEmail: "placeholder@example.com",
    credentials: parsed,
  });

  if (!result.success) {
    throw new EmailProviderValidationError(formatZodError(result.error));
  }

  return result.data.credentials;
}

function serializeCredentials(credentials: ProviderCredentialsInput): string {
  return encrypt(JSON.stringify(credentials));
}

function buildCredentialsMeta(
  provider: ProviderType,
  credentials: ProviderCredentialsInput | null,
): EmailProviderCredentialsMeta {
  if (!credentials) {
    return { hasCredentials: false };
  }

  switch (provider) {
    case ProviderType.SMTP: {
      const smtp = credentials as {
        host: string;
        port: number;
        user: string;
        secure: boolean;
      };
      return {
        hasCredentials: true,
        host: smtp.host,
        port: smtp.port,
        user: smtp.user,
        secure: smtp.secure,
      };
    }
    case ProviderType.SES: {
      const ses = credentials as { region: string };
      return {
        hasCredentials: true,
        region: ses.region,
      };
    }
    case ProviderType.Mailgun: {
      const mailgun = credentials as { domain: string };
      return {
        hasCredentials: true,
        domain: mailgun.domain,
      };
    }
    default:
      return { hasCredentials: true };
  }
}

function toEmailProviderDto(record: EmailProvider): EmailProviderDto {
  let credentials: ProviderCredentialsInput | null = null;

  if (record.credentialsEncrypted) {
    try {
      credentials = parseCredentials(record.provider, record.credentialsEncrypted);
    } catch {
      credentials = null;
    }
  }

  const meta = buildCredentialsMeta(record.provider, credentials);

  return {
    id: record.id,
    name: record.name ?? "",
    provider: record.provider,
    active: record.active,
    fromName: record.fromName ?? "",
    fromEmail: record.fromEmail ?? "",
    credentialsMeta: meta,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mergeCredentials(
  provider: ProviderType,
  existingEncrypted: string | null,
  incoming?: Partial<ProviderCredentialsInput>,
): ProviderCredentialsInput {
  if (!incoming) {
    return parseCredentials(provider, existingEncrypted);
  }

  const existing = existingEncrypted
    ? parseCredentials(provider, existingEncrypted)
    : null;

  switch (provider) {
    case ProviderType.SMTP: {
      const merged = {
        ...(existing ?? {}),
        ...incoming,
      };
      const result = emailProviderCreateSchema.safeParse({
        provider,
        name: "placeholder",
        fromName: "placeholder",
        fromEmail: "placeholder@example.com",
        credentials: merged,
      });
      if (!result.success) {
        throw new EmailProviderValidationError(formatZodError(result.error));
      }
      return result.data.credentials;
    }
    case ProviderType.Resend:
    case ProviderType.SendGrid:
    case ProviderType.Mailgun:
    case ProviderType.Postmark: {
      const secretKey =
        provider === ProviderType.Postmark ? "serverToken" : "apiKey";
      const merged = {
        ...(existing ?? {}),
        ...incoming,
      } as Record<string, string | undefined>;

      if (!merged[secretKey] && existing) {
        return existing as ProviderCredentialsInput;
      }

      const result = emailProviderCreateSchema.safeParse({
        provider,
        name: "placeholder",
        fromName: "placeholder",
        fromEmail: "placeholder@example.com",
        credentials: merged,
      });
      if (!result.success) {
        throw new EmailProviderValidationError(formatZodError(result.error));
      }
      return result.data.credentials;
    }
    case ProviderType.SES: {
      const merged = {
        ...(existing ?? {}),
        ...incoming,
      } as Record<string, string | undefined>;

      if (!merged.secretAccessKey && existing) {
        return existing as ProviderCredentialsInput;
      }

      const result = emailProviderCreateSchema.safeParse({
        provider,
        name: "placeholder",
        fromName: "placeholder",
        fromEmail: "placeholder@example.com",
        credentials: merged,
      });
      if (!result.success) {
        throw new EmailProviderValidationError(formatZodError(result.error));
      }
      return result.data.credentials;
    }
    default:
      throw new EmailProviderValidationError("Tipo de provedor inválido.");
  }
}

export class EmailProviderService {
  async listProviders(): Promise<EmailProviderDto[]> {
    const items = await listEmailProviders();
    return items.map(toEmailProviderDto);
  }

  async getProviderById(id: string): Promise<EmailProviderDto | null> {
    const record = await findEmailProviderById(id);
    return record ? toEmailProviderDto(record) : null;
  }

  async createProvider(
    input: EmailProviderCreateInput,
    actorId: string,
  ): Promise<EmailProviderDto> {
    const parsed = emailProviderCreateSchema.safeParse(input);
    if (!parsed.success) {
      throw new EmailProviderValidationError(formatZodError(parsed.error));
    }

    const record = await createEmailProvider({
      name: parsed.data.name,
      provider: parsed.data.provider,
      fromName: parsed.data.fromName,
      fromEmail: parsed.data.fromEmail,
      credentialsEncrypted: serializeCredentials(parsed.data.credentials),
    });

    await auditLog({
      actorId,
      action: "emailProvider.created",
      entity: "EmailProvider",
      entityId: record.id,
      payload: { name: record.name, provider: record.provider },
    });

    return toEmailProviderDto(record);
  }

  async updateProvider(
    id: string,
    input: EmailProviderUpdateInput,
    actorId: string,
  ): Promise<EmailProviderDto> {
    const existing = await findEmailProviderById(id);
    if (!existing) {
      throw new EmailProviderNotFoundError();
    }

    if (existing.provider !== input.provider) {
      throw new EmailProviderValidationError(
        "Não é permitido alterar o tipo do provedor.",
      );
    }

    const parsed = emailProviderUpdateSchema.safeParse(input);
    if (!parsed.success) {
      throw new EmailProviderValidationError(formatZodError(parsed.error));
    }

    const credentials = parsed.data.credentials
      ? mergeCredentials(
          existing.provider,
          existing.credentialsEncrypted,
          parsed.data.credentials,
        )
      : undefined;

    const record = await updateEmailProvider(id, {
      name: parsed.data.name,
      fromName: parsed.data.fromName,
      fromEmail: parsed.data.fromEmail,
      credentialsEncrypted: credentials
        ? serializeCredentials(credentials)
        : undefined,
    });

    await auditLog({
      actorId,
      action: "emailProvider.updated",
      entity: "EmailProvider",
      entityId: record.id,
      payload: { name: record.name, provider: record.provider },
    });

    return toEmailProviderDto(record);
  }

  async deleteProvider(id: string, actorId: string): Promise<void> {
    const existing = await findEmailProviderById(id);
    if (!existing) {
      throw new EmailProviderNotFoundError();
    }

    await deleteEmailProvider(id);

    await auditLog({
      actorId,
      action: "emailProvider.deleted",
      entity: "EmailProvider",
      entityId: id,
      payload: { name: existing.name, provider: existing.provider },
    });
  }

  async activateProvider(id: string, actorId: string): Promise<EmailProviderDto> {
    const existing = await findEmailProviderById(id);
    if (!existing) {
      throw new EmailProviderNotFoundError();
    }

    const record = await setActiveEmailProvider(id);

    await auditLog({
      actorId,
      action: "emailProvider.activated",
      entity: "EmailProvider",
      entityId: record.id,
      payload: { name: record.name, provider: record.provider },
    });

    return toEmailProviderDto(record);
  }

  async testConnection(
    input: EmailProviderTestInput,
    actorId: string,
  ): Promise<ConnectionTestResponse> {
    const parsed = emailProviderTestSchema.safeParse(input);
    if (!parsed.success) {
      throw new EmailProviderValidationError(formatZodError(parsed.error));
    }

    if (parsed.data.mode === "saved") {
      const record = await findEmailProviderById(parsed.data.providerId);
      if (!record) {
        throw new EmailProviderNotFoundError();
      }

      const credentials = parseCredentials(
        record.provider,
        record.credentialsEncrypted,
      );

      const result = await testProviderConnection(record.provider, {
        fromName: record.fromName ?? "",
        fromEmail: record.fromEmail ?? "",
        credentials,
      });

      await auditLog({
        actorId,
        action: "emailProvider.connection_tested",
        entity: "EmailProvider",
        entityId: record.id,
        payload: { success: result.success, provider: record.provider },
      });

      return result;
    }

    const result = await testProviderConnection(parsed.data.config.provider, {
      fromName: parsed.data.config.fromName,
      fromEmail: parsed.data.config.fromEmail,
      credentials: parsed.data.config.credentials,
    });

    await auditLog({
      actorId,
      action: "emailProvider.connection_tested",
      entity: "EmailProvider",
      payload: { success: result.success, provider: parsed.data.config.provider },
    });

    return result;
  }
}

let serviceInstance: EmailProviderService | null = null;

export function getEmailProviderService(): EmailProviderService {
  if (!serviceInstance) {
    serviceInstance = new EmailProviderService();
  }
  return serviceInstance;
}

export function resetEmailProviderServiceForTests(): void {
  serviceInstance = null;
}

// Helpers exportados para testes unitários.
export const __testables = {
  toEmailProviderDto,
  serializeCredentials,
  parseCredentials,
  buildCredentialsMeta,
};
