// Verificação de credenciais (e-mail/senha) no servidor.
// Extraído do provider para ser testável de forma isolada (SRP).
import bcrypt from "bcryptjs";

import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";

/// Dados do usuário expostos à sessão (nunca inclui o hash da senha).
export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
}

/// Valida a entrada e confere a senha contra o hash bcrypt armazenado.
/// Retorna o usuário autenticado ou `null` (credenciais inválidas).
export async function verifyCredentials(
  rawCredentials: unknown,
): Promise<AuthenticatedUser | null> {
  const parsed = loginSchema.safeParse(rawCredentials);
  if (!parsed.success) {
    return null;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
  };
}
