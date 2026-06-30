## Context

Os modelos de Auth.js já existem (`database-schema`). Esta change configura autenticação,
sessão e RBAC com 4 perfis internos. Princípio zero trust: autorização vive no servidor; a UI
apenas reflete estado.

## Goals / Non-Goals

**Goals:**
- Login/sessão via Auth.js + Prisma Adapter com cookies seguros.
- Mapa de permissões por perfil e helpers de verificação no servidor.
- Middleware de rotas + guardas em Server Actions/Route Handlers.

**Non-Goals:**
- Não cobre cadastro self-service público (sistema interno; usuários geridos por Administrador).
- Não implementa telas de cada módulo (apenas a proteção e o login).

## Decisions

- **Auth.js + Prisma Adapter**: padrão da stack; reaproveita os modelos existentes. Estratégia
  de sessão por cookie HttpOnly/Secure (preferência da regra de segurança). Alternativa
  (auth caseira) rejeitada por risco.
- **Mapa de permissões centralizado** (`src/lib/permissions.ts` ou similar): define
  ação→perfis. Helpers `getCurrentUser` e `requireRole` em `src/services`/`src/lib`. Favorece
  DRY e SRP, e mantém a autorização testável.
- **Dupla camada de proteção**: middleware para UX (redirect) + guardas no servidor (401/403)
  para segurança real. Ocultar UI por papel é apenas UX.
- **Erros consistentes** sem vazar detalhes internos (regra de segurança).

## Risks / Trade-offs

- [Middleware do Next não substitui validação no servidor] → sempre validar também em
  actions/handlers; documentado explicitamente.
- [Complexidade de RBAC pode crescer] → manter mapa declarativo e simples (KISS), evoluível.
- [Sessão e edge runtime] → escolher estratégia de sessão compatível com o deploy alvo.

## Migration Plan

1. Configurar Auth.js + adapter e provider de credenciais.
2. Criar helpers de usuário/permissão.
3. Adicionar `middleware.ts` e guardas nas actions/handlers.
4. Telas de login/logout e tratamento de 401/403.
Rollback: desabilitar middleware/guards reverte ao estado sem proteção (apenas em dev).

## Open Questions

- Provider(s) de login além de credenciais (e-mail/senha) — confirmar necessidade com o time.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`.
- É pré-requisito de: `file-storage`, `contacts`, `templates`, `campaigns`, `email-config`, `sending`, `scheduling`, `history-logs`, `dashboard`, `ui-extras`.
