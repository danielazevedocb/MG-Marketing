---
description: Expo (TS) — navegação (Expo Router) e organização de rotas
globs:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "expo-env.d.ts"
  - "app.json"
  - "app.config.*"
alwaysApply: false
---

- Para padrões detalhados de rotas, layouts e navegação, carregar a skill em `.claude/skills/expo-best-practices`.
- **Expo Router** quando o projeto usa rotas em `app/`; arquivos em `app/` são só rotas — compõem hooks/componentes de `src/features/`.
- **Preserve a estrutura atual** antes de criar novos groups ou pastas.

- **Layouts e providers**:
  - `app/_layout.tsx` — providers globais (ex.: `QueryClientProvider`), import de `globals.css` (NativeWind), splash/fonts.
  - Route groups `(auth)` e `(app)` para separar fluxos sem afetar a URL.
  - `(tabs)/` ou modais só se o projeto já usar esse padrão — não inventar groups sem necessidade.

- **Proteção de rota (gating)**:
  - Centralizar no `_layout.tsx` do group protegido (ex.: `(app)`), com `<Redirect />` — não espalhar redirects em cada tela.
  - Após login: preferir `router.replace('/(app)/')` em vez de empilhar telas de auth.

- **Rotas e nomes**:
  - Arquivos de rota consistentes (ex.: kebab-case); componentes em PascalCase.
  - Params explícitos: `[id].tsx`, `[...rest].tsx`.
  - Habilitar `experiments.typedRoutes` no `app.json` quando o projeto suportar; usar `router.push` com type-safety.

- **Params**:
  - Tipar com `useLocalSearchParams<{ id: string }>()` e validar (Zod) antes de usar em queries.
  - Params inválidos/ausentes: fallback seguro (erro + voltar/redirect consistente).

- **Navegação**:
  - `<Link>` para links visíveis no JSX; `useRouter()` para navegação com lógica (pós-login, pós-submit).
  - Padronizar `push`, `replace` e modal; fluxos destrutivos com confirmação.

- **Deep links**: considerar cold start, rotas suportadas e validação de params.

- Antes de propor detalhes de API do `expo-router`, consulte documentação via Context7 (conforme `01-geral.md`).
