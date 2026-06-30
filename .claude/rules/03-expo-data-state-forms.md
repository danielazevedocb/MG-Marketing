---
description: Expo (TS) — dados (TanStack Query), estado e formulários
globs:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/features/**/*
alwaysApply: false
---

- Para padrões detalhados de Query, features e forms, carregar a skill em `.claude/skills/expo-best-practices`.
- **Separação de camadas** (padrão da skill; pastas em `02-expo-src-structure.md`):
  - Telas em `app/`; UI e dados em `src/features/<nome>/` — sem HTTP inline em componentes.
  - `api.ts`, `queryKeys.ts`, `hooks/` e `lib/queryClient.ts` conforme a árvore de `src/`.

- **TanStack Query** (quando o projeto usa):
  - Query keys em `src/features/<nome>/queryKeys.ts` (evitar strings soltas).
  - Defaults mobile-friendly: `refetchOnWindowFocus: false`, `staleTime` adequado, `retry` explícito.
  - **Só estado de servidor** em `useQuery`/`useMutation` — UI (modal, filtro, input) com `useState`/`useReducer`.
  - Mutations: invalidar/refetch **de forma intencional** (ex.: `profileKeys.detail(id)`), não “invalidate tudo”.
  - Erros normalizados (ex.: `ApiError`) para UX consistente, sem vazar detalhes internos.

- **Estado local/global leve** (padrão da skill): `useState`, `useReducer`, Context — dividir Context em leitura vs dispatch quando evitar re-renders.
- **Zustand / persistência extra**: só seguir padrões do repo se o projeto **já** usar; não introduzir como padrão alternativo à skill. Não persistir credenciais/PII em storage inseguro (alinha com `security.md`).

- **Formulários** (RHF + Zod quando o projeto já usa):
  - Um schema Zod por form; `zodResolver` quando aplicável.
  - Submit: estado `submitting`, CTA desabilitado, evitar double submit.
  - Validação no client é UX — o servidor valida de novo (`security.md`).

- **Offline e rede**:
  - Prever ausência de internet, timeout, retry e “tentar novamente”.
  - Offline-first exige desenho de cache/conflitos antes de “só salvar local”.

- Antes de propor API/config de React Query, RHF ou Zod, consulte documentação via Context7 (conforme `01-geral.md`).
