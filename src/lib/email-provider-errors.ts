// Erros de domínio de provedores de email — mensagens claras para o usuário.
export class EmailProviderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailProviderValidationError";
  }
}

export class EmailProviderNotFoundError extends Error {
  constructor(message = "Provedor de email não encontrado.") {
    super(message);
    this.name = "EmailProviderNotFoundError";
  }
}

export class EmailProviderConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailProviderConnectionError";
  }
}
