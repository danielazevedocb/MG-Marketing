// Erro de domínio da configuração de WhatsApp — mensagem clara para o usuário.
export class WhatsAppConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsAppConfigValidationError";
  }
}
