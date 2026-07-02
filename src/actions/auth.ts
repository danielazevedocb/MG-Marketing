"use server";

// Server Actions de autenticação (login/logout). A verificação real ocorre no
// servidor via Auth.js; a UI apenas dispara estas ações e reflete o resultado.
import { headers } from "next/headers";
import { AuthError } from "next-auth";

import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth.config";
import { signIn, signOut } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema, type LoginInput } from "@/schemas/auth";

export type LoginActionResult = { error?: string };

/// Autentica por credenciais. Revalida a entrada no servidor (zero trust).
/// Em sucesso, `signIn` lança o redirect do Next (relançado abaixo).
export async function loginAction(
  values: LoginInput,
): Promise<LoginActionResult> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const rateCheck = checkRateLimit(`login:${ip}`);
  if (!rateCheck.allowed) {
    return { error: "Muitas tentativas. Tente novamente em alguns instantes." };
  }

  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      // Mensagem genérica: não revela se o e-mail existe (evita enumeração).
      if (error.type === "CredentialsSignin") {
        return { error: "E-mail ou senha inválidos." };
      }
      return { error: "Não foi possível entrar. Tente novamente." };
    }
    // Relança o redirect de sucesso (NEXT_REDIRECT) e demais erros.
    throw error;
  }
}

/// Encerra a sessão e redireciona para o login.
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
