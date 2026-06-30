// Mapa de permissões por perfil (RBAC) — fonte da verdade declarativa.
// Princípio zero trust: este mapa é consultado SEMPRE no servidor. Qualquer
// ocultação de UI por perfil é apenas UX e não substitui a verificação aqui.
import { Role } from "@/generated/prisma/enums";

/// Lista canônica de permissões da aplicação no formato `recurso:ação`.
/// Novos módulos adicionam suas permissões aqui (KISS/DRY).
export const PERMISSIONS = [
  "contacts:read",
  "contacts:write",
  "templates:read",
  "templates:write",
  "campaigns:read",
  "campaigns:write",
  "campaigns:send",
  "history:read",
  "emailConfig:read",
  "emailConfig:write",
  "files:read",
  "files:write",
  "users:read",
  "users:write",
  "audit:read",
  "settings:write",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/// Permissões somente de leitura (derivadas) — usadas pelo perfil Visualizador.
/// Auditoria (`audit:read`) fica restrita ao Administrador.
const READ_ONLY_PERMISSIONS = PERMISSIONS.filter(
  (permission) => permission.endsWith(":read") && permission !== "audit:read",
);

/// Mapa declarativo perfil → permissões.
/// Administrador recebe todas; demais perfis recebem subconjuntos explícitos.
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [Role.Administrador]: PERMISSIONS,
  [Role.Marketing]: [
    "contacts:read",
    "contacts:write",
    "templates:read",
    "templates:write",
    "campaigns:read",
    "campaigns:write",
    "campaigns:send",
    "history:read",
    "emailConfig:read",
    "files:read",
    "files:write",
  ],
  [Role.Comercial]: [
    "contacts:read",
    "contacts:write",
    "templates:read",
    "campaigns:read",
    "campaigns:write",
    "campaigns:send",
    "history:read",
    "files:read",
    "files:write",
  ],
  [Role.Visualizador]: READ_ONLY_PERMISSIONS,
};

/// Verifica se um perfil possui uma permissão. Função pura e testável.
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/// Verifica se um perfil possui TODAS as permissões informadas.
export function hasAllPermissions(
  role: Role,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
