---
description: Expo (TS) — organização e responsabilidades de src/
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
alwaysApply: false
---

- Para árvore completa, exemplos e checklist de nova feature, carregar a skill em `.claude/skills/expo-best-practices`.
- **Preserve a estrutura atual** antes de criar pastas novas; migre para o padrão abaixo só quando fizer sentido.

## Árvore de referência

```
src/
  components/
    ui/           ← primitivos (Button, Input, Card) — sem API, sem negócio
    shared/       ← compostos reutilizáveis (UserAvatar, ErrorBoundary)
  features/
    <nome>/
      api.ts
      types.ts
      queryKeys.ts
      hooks/
      components/
  hooks/          ← genéricos (useDebounce, useNetworkStatus)
  lib/            ← queryClient, apiClient, configs de libs
  types/          ← globais (env.d.ts, utilitários TS)
  constants/      ← cores, spacing, strings fixas
  utils/          ← funções puras, sem side effects
```

## Onde colocar cada coisa

| Conteúdo                    | Pasta                          | Não colocar em                                 |
| --------------------------- | ------------------------------ | ---------------------------------------------- |
| Fetch/mutation da feature   | `features/<nome>/api.ts`       | `app/`, `components/ui/`                       |
| `useQuery` / `useMutation`  | `features/<nome>/hooks/`       | telas em `app/`                                |
| Query keys                  | `features/<nome>/queryKeys.ts` | strings soltas em hooks                        |
| Tipos da feature            | `features/<nome>/types.ts`     | `types/` global (só se for compartilhado)      |
| UI só da feature            | `features/<nome>/components/`  | `components/shared/`                           |
| Botão, Input, Card          | `components/ui/`               | `features/` (a menos que seja 100% específico) |
| Composição cross-feature    | `components/shared/`           | dentro de uma feature                          |
| Client HTTP / QueryClient   | `lib/`                         | `features/*/api.ts` duplicando config          |
| Hook sem domínio de negócio | `hooks/`                       | `features/*/hooks/`                            |

## Regras por pasta

- **`features/<nome>/`**: módulo auto-suficiente; importações entre features só via API pública clara (hooks/types), evitando importar `components/` internos de outra feature.
- **`components/ui/`**: props + estilo; variantes NativeWind com classes completas em build time.
- **`components/shared/`**: pode compor `ui/`; sem chamadas HTTP diretas (recebe dados via props ou hooks de feature).
- **`lib/`**: instâncias e `defaultOptions` (ex.: `refetchOnWindowFocus: false` no mobile).
- **`utils/`**: sem React, sem fetch, sem acesso a storage.
- **`constants/`**: valores reutilizados; não duplicar magic numbers em features.

## Nova feature (ordem)

1. `types.ts` → 2. `api.ts` → 3. `queryKeys.ts` → 4. `hooks/` → 5. `components/` → 6. rota em `app/` que só compõe.

## Evitar

- `src/screens/` ou `src/services/` paralelos a `features/` (legado — não criar em projeto novo).
- Lógica de negócio ou `fetch` em `components/ui/`.
- Barrel files gigantes (`index.ts` exportando tudo) sem necessidade.
- Import de `app/` para dentro de `src/` (dependência invertida).

## Imports

- Alias `@/*` → `./src/*` no `tsconfig`.
- Rotas em `app/` importam de `@/features/...`, `@/components/...` — nunca o contrário.
