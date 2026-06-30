## Context

O repositório contém apenas configs em `.claude/`. Esta change cria a fundação técnica sobre a
qual todos os módulos seguintes serão construídos. É a raiz da ordem de desenvolvimento e não
depende de nenhuma outra change. As decisões aqui (estrutura de camadas, tooling, tema)
definem convenções para todo o projeto.

Restrições: stack obrigatória (Next.js 15 App Router, React 19, TS, Tailwind v4, shadcn/ui,
Magic UI, Framer Motion, Lucide, RHF, Zod, TanStack Query, Next Themes); sistema interno
single-org (sem multi-tenancy); segredos apenas no servidor.

## Goals / Non-Goals

**Goals:**
- Scaffold Next.js + estrutura de pastas exata, pronta para receber os módulos.
- Camadas claras: `actions` (Server Actions) → `services` (regras de negócio) → `repositories` (Prisma).
- Tema light/dark, providers globais (Theme + TanStack Query) e tooling de qualidade.
- Ambiente de testes (Vitest + Testing Library) com smoke test.

**Non-Goals:**
- Não cria schema Prisma/modelos (fica em `database-schema`).
- Não implementa autenticação, RBAC ou regras de negócio.
- Não cria telas de funcionalidades (campanhas, contatos, etc.).

## Decisions

- **App Router + Server Components por padrão**: melhor performance e alinhamento com a stack;
  `"use client"` apenas quando há interatividade. Alternativa (Pages Router) descartada por
  ser legada.
- **Arquitetura em camadas (Clean Architecture)**: `actions` orquestram, `services` contêm
  regras de negócio, `repositories` isolam o acesso a dados, `schemas` (Zod) validam entradas,
  `types` compartilham contratos. Garante SRP (SOLID), DRY e testabilidade. Alternativa (lógica
  em componentes/rotas) descartada por acoplar UI e negócio.
- **TanStack Query no cliente + Server Actions/RSC no servidor**: cache e UX no cliente sem
  duplicar a fonte da verdade (servidor). KISS: evita gerenciador de estado global pesado.
- **shadcn/ui como base + Magic UI como efeitos**: evita duas fontes para o mesmo componente;
  Magic UI agrega showcase respeitando `prefers-reduced-motion`.
- **Vitest + Testing Library**: rápido, compatível com TS/ESM e com a stack Next; alternativa
  (Jest) descartada por configuração mais pesada com ESM.
- **Pastas vazias versionadas com `.gitkeep`** para preservar a arquitetura desde o início.

## Risks / Trade-offs

- [Tailwind v4 é recente e muda a configuração em relação ao v3] → seguir documentação atual
  (via Context7) e isolar config em `src/styles`.
- [React 19 + libs de animação podem ter incompatibilidades] → fixar versões compatíveis e
  cobrir com smoke test.
- [Estrutura de pastas extensa criada "vazia"] → mitigar com `.gitkeep` e README/roadmap
  documentando o propósito de cada camada.

## Migration Plan

1. Inicializar app Next.js e dependências.
2. Criar estrutura de pastas + aliases + `.env.example`.
3. Configurar Tailwind v4, tema e providers (Theme, TanStack Query).
4. Configurar ESLint/Prettier e Vitest + smoke test.
Rollback: change isolada; reverter equivale a remover o scaffold (nenhum dado afetado).

## Open Questions

- Versões exatas (pinning) de Magic UI/Framer Motion compatíveis com React 19 — confirmar na implementação via Context7.

## Dependências entre changes

- Depende de: nenhuma (raiz da ordem de desenvolvimento).
- É pré-requisito de: todas as demais changes (database-schema, auth-rbac, file-storage, contacts, templates, campaigns, preview, email-config, sending, scheduling, history-logs, dashboard, ui-extras).
