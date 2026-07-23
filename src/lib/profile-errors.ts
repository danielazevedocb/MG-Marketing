// Erro de domínio do perfil do usuário — mensagem clara para o usuário.
export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileValidationError";
  }
}
