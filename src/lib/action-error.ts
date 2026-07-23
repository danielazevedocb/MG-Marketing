// Mapeamento padronizado de erros para o retorno de Server Actions.
// Cada módulo de actions tinha sua própria cópia de `mapActionError`; este
// helper centraliza o tratamento comum (401/403/Zod) e recebe as classes de
// erro de domínio específicas de cada módulo via `knownErrors`.
import { z } from "zod";

import { ForbiddenError, UnauthorizedError } from "@/lib/auth-errors";

export type ActionError = { success: false; error: string; status?: number };
export type ActionSuccess<T> = { success: true; data: T };
export type ActionResult<T> = ActionSuccess<T> | ActionError;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorClass = new (...args: any[]) => Error;

export type MapActionErrorOptions = {
  /** Classes de erro de domínio repassadas como mensagem de negócio (sem status especial). */
  knownErrors?: readonly ErrorClass[];
  /** Mensagem genérica quando nenhum caso conhecido casar. */
  fallbackMessage?: string;
  /** Formata `ZodError` com mensagem específica do domínio (opcional). */
  formatZodError?: (error: z.ZodError) => string;
};

const DEFAULT_FALLBACK_MESSAGE = "Não foi possível concluir a operação.";

export function mapActionError(
  error: unknown,
  options: MapActionErrorOptions = {},
): ActionError {
  const {
    knownErrors = [],
    fallbackMessage = DEFAULT_FALLBACK_MESSAGE,
    formatZodError,
  } = options;

  if (error instanceof UnauthorizedError) {
    return { success: false, error: error.message, status: 401 };
  }
  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message, status: 403 };
  }
  for (const KnownError of knownErrors) {
    if (error instanceof KnownError) {
      return { success: false, error: error.message };
    }
  }
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: formatZodError ? formatZodError(error) : fallbackMessage,
    };
  }
  // Erro não reconhecido (ex.: violação de constraint no banco) — logar no
  // servidor para não perder o rastro por trás da mensagem genérica ao cliente.
  console.error("[mapActionError] erro não tratado:", error);
  return { success: false, error: fallbackMessage };
}
