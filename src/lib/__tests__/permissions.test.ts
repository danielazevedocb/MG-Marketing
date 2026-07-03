import { describe, expect, it } from "vitest";

import { Role } from "@/generated/prisma/enums";
import {
  hasPermission,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "@/lib/permissions";

describe("RBAC — mapa de permissões por perfil", () => {
  it("Administrador possui todas as permissões", () => {
    for (const permission of PERMISSIONS) {
      expect(hasPermission(Role.Administrador, permission)).toBe(true);
    }
  });

  it("Visualizador só possui permissões de leitura", () => {
    const writePermission = "contacts:write" as const;
    const readPermission = "contacts:read" as const;

    expect(hasPermission(Role.Visualizador, readPermission)).toBe(true);
    expect(hasPermission(Role.Visualizador, writePermission)).toBe(false);

    // Nenhuma permissão concedida ao Visualizador pode ser de escrita.
    for (const permission of ROLE_PERMISSIONS[Role.Visualizador]) {
      expect(permission.endsWith(":read")).toBe(true);
    }
  });

  it("Visualizador não pode acessar auditoria", () => {
    expect(hasPermission(Role.Visualizador, "audit:read")).toBe(false);
    expect(hasPermission(Role.Administrador, "audit:read")).toBe(true);
  });

  it("Marketing pode escrever em contatos e enviar campanhas, mas não gerenciar usuários", () => {
    expect(hasPermission(Role.Marketing, "contacts:write")).toBe(true);
    expect(hasPermission(Role.Marketing, "campaigns:send")).toBe(true);
    expect(hasPermission(Role.Marketing, "users:write")).toBe(false);
  });

  it("Comercial pode escrever templates e contatos, mas não gerenciar usuários", () => {
    expect(hasPermission(Role.Comercial, "templates:write")).toBe(true);
    expect(hasPermission(Role.Comercial, "contacts:write")).toBe(true);
    expect(hasPermission(Role.Comercial, "users:write")).toBe(false);
  });
});
