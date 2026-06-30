// Erros de domínio de contatos — mensagens claras para o usuário.
export class ContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactValidationError";
  }
}
