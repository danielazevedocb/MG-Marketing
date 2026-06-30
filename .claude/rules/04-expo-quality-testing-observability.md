---
description: Expo (TS) — qualidade, testes, performance, a11y e observabilidade
globs:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "e2e/**/*"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "jest.config.*"
  - "detox.config.*"
alwaysApply: false
---

- Para checklist de performance em listas, imagens e re-renders, carregar a skill em `.claude/skills/expo-best-practices`.
- **Lint/format e tipos**:
  - Seguir ESLint/Prettier do repo; `strict: true` e alias `@/*` → `./src/*` quando o projeto usar.
  - Evitar `any`; Zod + `z.infer` para contratos de API quando necessário.
  - Nova feature: ordem sugerida na skill — types → api → queryKeys → hooks → components → rota em `app/`; `tsc --noEmit` antes de concluir.

- **Testes (React Native)**:
  - Preferir `@testing-library/react-native` (comportamento do usuário).
  - Mockar rede e tempo de forma previsível; evitar acoplamento à implementação.

- **E2E**:
  - **Detox** quando o repo já usa/aceita (Playwright é mais para web).
  - Fluxos críticos: login, navegação principal, erro de rede/offline, ação principal do produto.

- **Performance** (alinhar com a skill):
  - Listas: `FlatList` com `keyExtractor` estável, `renderItem` em `useCallback`, itens com `React.memo`.
  - Altura fixa: fornecer `getItemLayout`; ajustar `windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews` quando necessário.
  - Imagens remotas: `expo-image` (cache, placeholder, transição) — não `<Image>` do RN para URLs.
  - Memoização só com ganho real; props primitivas quando possível.

- **Acessibilidade**:
  - `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` quando aplicável.
  - Alvos de toque confortáveis, contraste, feedback para loading/disabled/error.
  - Respeitar preferências do sistema (fonte, reduced motion) quando suportado.

- **Observabilidade** (quando existir no projeto):
  - Eventos padronizados; sem PII em analytics/logs.
  - Produção: mensagem amigável + log estruturado (sem secrets).

- Antes de propor setup de Jest/Detox/analytics/crash reporting, consulte documentação via Context7 (conforme `01-geral.md`).
