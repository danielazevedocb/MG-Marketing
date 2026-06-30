## Context

Última change da ordem de desenvolvimento: consolida recursos transversais de UX e performance
sobre os módulos já existentes. Não introduz regras de negócio; aprimora a experiência.

## Goals / Non-Goals

**Goals:**
- Busca global + Command Menu (Ctrl+K) respeitando RBAC.
- Toasts, autosave, skeletons, empty states e favoritos consistentes.
- Performance (streaming, dynamic imports, caching) e polimento de tema.

**Non-Goals:**
- Não altera dados/regras de domínio.
- Não substitui buscas específicas de cada módulo (as complementa de forma global).

## Decisions

- **Command Menu via componente shadcn/ui (Command)** + provider global; atalho `Ctrl+K`.
  Acessível por teclado.
- **Busca global agregando módulos** por uma camada de busca que respeita permissões (RBAC) —
  resultados nunca expõem itens não permitidos (segurança).
- **Toasts** centralizados (provider) e **autosave** via hook reutilizável com debounce,
  aplicado a formulários longos (ex.: wizard de campanhas) — DRY.
- **Skeletons/empty states** padronizados em `src/components` para consistência.
- **Performance**: `dynamic()` para componentes pesados, streaming/Suspense em páginas, caching
  (RSC + TanStack Query). Respeitar `prefers-reduced-motion`.
- **Favoritos transversais** com estado por usuário (reutiliza padrão de templates).

## Risks / Trade-offs

- [Busca global vazar itens sem permissão] → filtrar por RBAC no servidor sempre.
- [Autosave gerar escrita excessiva] → debounce e escrita condicional (diffs).
- [Excesso de dynamic import] → aplicar apenas onde há ganho real (medir).

## Migration Plan

1. Provider de toasts + hook de autosave.
2. Command Menu + busca global (com RBAC).
3. Skeletons/empty states/favoritos padronizados.
4. Otimizações de performance e polimento de tema.
Rollback: recursos isolados; podem ser desativados individualmente.

## Open Questions

- Escopo inicial da busca global (quais entidades primeiro) — priorizar com o time.

## Dependências entre changes

- Depende de: `project-foundation`; para conteúdo de busca/favoritos, de `contacts`, `templates`, `campaigns` (e demais módulos de dados).
- É a camada final de polimento (não é pré-requisito de outras changes).
