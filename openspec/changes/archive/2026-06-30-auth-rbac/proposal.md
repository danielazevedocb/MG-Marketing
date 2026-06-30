## Why

O MG Marketing é interno e precisa restringir o acesso por perfil. Sem autenticação e controle
de acesso (RBAC) no servidor, qualquer rota ou Server Action ficaria exposta. É necessário um
login confiável e regras de permissão aplicadas na fonte da verdade (servidor).

## What Changes

- Configurar Auth.js com Prisma Adapter usando os modelos já definidos em `database-schema`.
- Fluxo de login e gestão de sessão.
- RBAC para 4 perfis: `Administrador`, `Marketing`, `Comercial`, `Visualizador`.
- Middleware protegendo rotas do `app/` e guardas para Server Actions/Route Handlers.
- Helpers de autorização (ex.: `requireRole`, `getCurrentUser`) reutilizáveis nas camadas.
- Mensagens claras de 401/403 e redirecionamentos de UX.

## Capabilities

### New Capabilities
- `authentication`: login, sessão e integração Auth.js + Prisma Adapter.
- `authorization-rbac`: modelo de permissões por perfil e helpers de verificação no servidor.
- `route-protection`: middleware e guardas que protegem rotas, Server Actions e Route Handlers.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria configuração do Auth.js, `middleware.ts`, helpers em `src/lib`/`src/services`, e proteção nas `actions`.
- Depende de `project-foundation` e `database-schema`.
- É pré-requisito de todos os módulos que exigem usuário autenticado e permissão (`contacts`, `templates`, `campaigns`, `email-config`, `sending`, `scheduling`, `history-logs`, `dashboard`, `file-storage`).
