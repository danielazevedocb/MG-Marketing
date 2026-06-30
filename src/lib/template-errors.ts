// Erros de domínio de templates — mensagens claras para o usuário.
export class TemplateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateValidationError";
  }
}
