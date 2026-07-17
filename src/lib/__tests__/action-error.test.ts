import { z } from "zod";
import { describe, expect, it } from "vitest";

import { mapActionError } from "@/lib/action-error";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth-errors";

class DomainError extends Error {}

describe("mapActionError", () => {
  it("mapeia UnauthorizedError para status 401", () => {
    const result = mapActionError(new UnauthorizedError());
    expect(result).toEqual({
      success: false,
      error: expect.any(String),
      status: 401,
    });
  });

  it("mapeia ForbiddenError para status 403", () => {
    const result = mapActionError(new ForbiddenError());
    expect(result).toEqual({
      success: false,
      error: expect.any(String),
      status: 403,
    });
  });

  it("repassa a mensagem de um erro de domínio conhecido, sem status especial", () => {
    const result = mapActionError(new DomainError("Nome já existe"), {
      knownErrors: [DomainError],
    });
    expect(result).toEqual({ success: false, error: "Nome já existe" });
  });

  it("usa a mensagem genérica de fallback para erros desconhecidos", () => {
    const result = mapActionError(new Error("detalhe interno sensível"));
    expect(result).toEqual({
      success: false,
      error: "Não foi possível concluir a operação.",
    });
  });

  it("permite fallback customizado por módulo", () => {
    const result = mapActionError(new Error("x"), {
      fallbackMessage: "Não foi possível concluir a busca.",
    });
    expect(result.error).toBe("Não foi possível concluir a busca.");
  });

  it("usa formatZodError quando informado para ZodError", () => {
    const schema = z.object({ nome: z.string().min(1) });
    const parsed = schema.safeParse({ nome: "" });
    if (parsed.success) throw new Error("deveria falhar no parse");

    const result = mapActionError(parsed.error, {
      formatZodError: () => "Verifique os campos e tente novamente",
    });
    expect(result.error).toBe("Verifique os campos e tente novamente");
  });

  it("usa a mensagem genérica para ZodError quando formatZodError não é informado", () => {
    const schema = z.object({ nome: z.string().min(1) });
    const parsed = schema.safeParse({ nome: "" });
    if (parsed.success) throw new Error("deveria falhar no parse");

    const result = mapActionError(parsed.error);
    expect(result.error).toBe("Não foi possível concluir a operação.");
  });
});
