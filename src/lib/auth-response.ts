// Converte erros de autorização em respostas HTTP consistentes para Route Handlers.
// Mantém mensagens claras e sem vazar detalhes internos (regra de segurança).
import { NextResponse } from "next/server";

import { ForbiddenError, UnauthorizedError } from "@/lib/auth-errors";

export function toAuthErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  // Erro inesperado: resposta genérica (sem stack trace).
  return NextResponse.json(
    { error: "Erro interno do servidor" },
    { status: 500 },
  );
}
