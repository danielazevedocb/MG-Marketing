## Context

O modelo `Template` (+ `TemplateType`) já existe. Esta change implementa o domínio de templates
em camadas, com editor visual e preview. Usa `file-storage` para imagens. É base para campanhas.

## Goals / Non-Goals

**Goals:**
- CRUD de templates com tipo, validação e RBAC.
- Favoritar, duplicar, buscar e categorizar.
- Editor visual estruturado + preview, sem HTML manual.

**Non-Goals:**
- Não implementa o preview dual WhatsApp/Email (fica em `preview`).
- Não implementa envio (fica em `sending`).

## Decisions

- **Conteúdo estruturado, não HTML cru**: o template guarda campos estruturados; o HTML final é
  gerado pelo sistema (em `sending`). Reduz risco de XSS e mantém padronização. Alternativa
  (editor HTML livre) rejeitada por segurança e consistência.
- **Duplicação como cópia profunda** do conteúdo, gerando novo registro independente (DRY na
  criação de campanhas).
- **Camadas** actions → services → repositories; schemas Zod compartilhados.
- **Editor visual** composto por componentes shadcn/ui em `src/components/forms`; preview
  reaproveitável pela change `preview`.

## Risks / Trade-offs

- [Acoplar template ao formato de campanha] → manter contrato de conteúdo estável e tipado.
- [Editor visual pode crescer em complexidade] → começar simples (KISS) e evoluir por tipo.
- [Sanitização de texto] → tratar entradas como dados, não HTML; sanitizar onde necessário.

## Migration Plan

1. Schemas + repository + service de templates.
2. CRUD + telas em `src/features/templates`.
3. Favoritar/duplicar/buscar/categorizar.
4. Editor visual + preview.
Rollback: feature isolada.

## Open Questions

- Estrutura exata do conteúdo por tipo de template — refinar com exemplos reais do time.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`, `file-storage`.
- É pré-requisito de: `campaigns`; relacionado a `preview`.
