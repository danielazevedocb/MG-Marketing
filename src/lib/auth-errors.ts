// Erros de autenticação/autorização com status HTTP associado.
// Permitem que actions e route handlers respondam 401/403 de forma consistente,
// sem vazar detalhes internos (regra de segurança).

export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = "Não autenticado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "Acesso negado") {
    super(message);
    this.name = "ForbiddenError";
  }
}
