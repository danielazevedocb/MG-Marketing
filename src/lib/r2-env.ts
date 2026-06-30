// Configuração do Cloudflare R2 (somente servidor — nunca importar em Client Components).
// Credenciais lidas de variáveis de ambiente sem prefixo NEXT_PUBLIC_*.

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

export class R2NotConfiguredError extends Error {
  constructor(message = "Storage R2 não configurado") {
    super(message);
    this.name = "R2NotConfiguredError";
  }
}

/// Indica se todas as variáveis R2 necessárias estão definidas.
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL,
  );
}

/// Retorna a configuração R2 ou lança se incompleta (lazy — só na hora do upload).
export function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicUrl
  ) {
    throw new R2NotConfiguredError();
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl: publicUrl.replace(/\/$/, ""),
  };
}
