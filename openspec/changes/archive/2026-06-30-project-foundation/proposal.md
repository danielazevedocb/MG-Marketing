## Why

O projeto MG Marketing começa do zero (apenas configs em `.claude/`). Antes de qualquer
funcionalidade de negócio é preciso uma base técnica sólida, padronizada e escalável que
estabeleça stack, arquitetura de pastas, tooling de qualidade, tema e camada de dados no
cliente. Sem essa fundação, cada módulo seguinte reinventaria estrutura e convenções, gerando
retrabalho e inconsistência.

## What Changes

- Scaffold da aplicação Next.js 15 (App Router) + React 19 + TypeScript (modo strict).
- Tailwind CSS v4 configurado com tokens de tema e suporte a dark mode.
- Integração de UI: shadcn/ui (base), Magic UI (efeitos), Framer Motion e Lucide React.
- Provedores globais: Next Themes (light/dark) e TanStack Query (cache de dados no cliente).
- Tooling de qualidade: ESLint + Prettier com scripts de lint/format.
- Estrutura de pastas exata do projeto (`src/app`, `src/actions`, `src/components/{ui,layout,dashboard,marketing,forms}`, `src/features/{campaigns,templates,contacts,history,settings}`, `src/hooks`, `src/lib`, `prisma`, `src/repositories`, `src/schemas`, `src/services`, `src/styles`, `src/types`, `src/utils`).
- Configuração de ambiente (`.env.example`) e aliases de import (`@/*`).
- Runner de testes (Vitest + Testing Library) com smoke test inicial.

Esta change NÃO introduz banco de dados, autenticação ou regras de negócio — apenas a fundação.

## Capabilities

### New Capabilities
- `project-scaffold`: estrutura base do app Next.js, arquitetura de pastas, aliases e configuração de ambiente.
- `ui-foundation`: integração de Tailwind v4, shadcn/ui, Magic UI, Framer Motion, Lucide, tema light/dark e provider TanStack Query.
- `tooling-quality`: ESLint, Prettier e runner de testes (Vitest + Testing Library) com smoke test.

### Modified Capabilities
<!-- Nenhuma: este é o primeiro change do projeto. -->

## Impact

- Cria toda a base de código em `src/` e `prisma/` (pasta), `package.json`, configs (`next.config`, `tsconfig`, `tailwind`, `eslint`, `prettier`, `vitest`).
- É dependência de TODAS as changes seguintes (database-schema, auth-rbac, etc.).
- Nenhuma dependência de outras changes (é a raiz da ordem de desenvolvimento).
