// Serviço de autenticação/autorização no servidor (fonte da verdade do RBAC).
// Reutilizável por Server Actions e Route Handlers. A UI apenas reflete estado.
import type { Session } from "next-auth";

import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth-errors";
import {
  hasPermission,
  type Permission,
} from "@/lib/permissions";
import type { Role } from "@/generated/prisma/enums";

type SessionUser = Session["user"];

/// Retorna o usuário autenticado (e seu papel) a partir da sessão, ou `null`.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/// Exige sessão válida; lança `UnauthorizedError` (401) se não houver.
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

/// Exige que o usuário possua um dos papéis informados; senão lança 403.
export async function requireRole(
  roles: Role | readonly Role[],
): Promise<SessionUser> {
  const user = await requireAuth();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) {
    throw new ForbiddenError();
  }
  return user;
}

/// Exige que o papel do usuário tenha a permissão informada; senão lança 403.
export async function requirePermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new ForbiddenError();
  }
  return user;
}
