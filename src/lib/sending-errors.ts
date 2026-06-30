// Erros de domínio do módulo de envio — mensagens claras para o usuário.
export class SendingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SendingError";
  }
}

export class NoActiveEmailProviderError extends SendingError {
  constructor() {
    super(
      "Nenhum provedor de email ativo. Configure um provedor em Configurações > Email antes de enviar.",
    );
    this.name = "NoActiveEmailProviderError";
  }
}
