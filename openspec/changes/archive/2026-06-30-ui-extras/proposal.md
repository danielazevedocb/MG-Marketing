## Why

Para entregar a experiência rápida e polida inspirada em Linear/Vercel/Notion, faltam recursos
transversais de produtividade e refinamento: busca global, command menu, toasts, autosave,
favoritos, estados de carregamento e otimizações de performance. Esta change consolida esses
extras de UX e performance.

## What Changes

- Busca global e Command Menu (Ctrl+K).
- Toasts consistentes e autosave em formulários longos.
- Favoritos transversais; lazy loading; skeleton loading; empty states.
- Polimento de tema light/dark.
- Performance: streaming, dynamic imports, caching.

## Capabilities

### New Capabilities
- `command-search`: busca global + Command Menu (Ctrl+K) navegando entre módulos.
- `ux-feedback`: toasts, autosave, skeletons, empty states e favoritos consistentes.
- `performance-polish`: streaming, dynamic imports, caching e refinamento de tema.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria componentes/hooks transversais em `src/components` e `src/hooks`, e ajustes de performance no `app/`.
- Depende de `project-foundation` e, para conteúdo de busca/favoritos, dos módulos de domínio (contacts, templates, campaigns).
- É a camada final de polimento; não altera regras de negócio.
