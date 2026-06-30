// Cliente S3-compatible para Cloudflare R2 (somente servidor).
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";

import { getR2Config, type R2Config } from "@/lib/r2-env";

export type R2ClientDeps = {
  config: R2Config;
  client: S3Client;
};

/// Cria um cliente S3 apontando para o endpoint R2.
export function createR2Client(config: R2Config): S3Client {
  const clientConfig: S3ClientConfig = {
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  };
  return new S3Client(clientConfig);
}

/// Factory padrão: lê config do ambiente e instancia o cliente.
export function createDefaultR2Client(): R2ClientDeps {
  const config = getR2Config();
  return { config, client: createR2Client(config) };
}

export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

/// Envia um objeto ao bucket R2.
export async function putObject(
  deps: R2ClientDeps,
  input: PutObjectInput,
): Promise<void> {
  await deps.client.send(
    new PutObjectCommand({
      Bucket: deps.config.bucketName,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );
}

/// Remove um objeto do bucket R2 pela chave.
export async function deleteObject(
  deps: R2ClientDeps,
  key: string,
): Promise<void> {
  await deps.client.send(
    new DeleteObjectCommand({
      Bucket: deps.config.bucketName,
      Key: key,
    }),
  );
}

/// Monta a URL pública a partir da chave do objeto.
export function buildPublicUrl(config: R2Config, key: string): string {
  return `${config.publicUrl}/${key}`;
}

/// Extrai a chave do objeto a partir da URL pública registrada.
export function extractKeyFromPublicUrl(
  config: R2Config,
  url: string,
): string | null {
  const prefix = `${config.publicUrl}/`;
  if (!url.startsWith(prefix)) {
    return null;
  }
  return url.slice(prefix.length);
}
