## Context

Os modelos `Contact`, `Group`, `Tag` já existem. Esta change implementa o domínio de contatos
em camadas (actions → services → repositories), com validação Zod e RBAC. Prepara a base de
destinatários para campanhas.

## Goals / Non-Goals

**Goals:**
- CRUD de contatos com validação e permissão.
- Importação CSV robusta (por linha) e abstração de importação do ERP MG.
- Grupos, tags, busca instantânea e filtros.

**Non-Goals:**
- Não implementa integração real do ERP MG (apenas a interface/placeholder).
- Não implementa seleção de destinatários da campanha (fica em `campaigns`).

## Decisions

- **Camadas claras**: `actions/contacts` orquestram, `services/contacts` aplicam regras,
  `repositories/contacts` acessam Prisma. SRP/DIP e testabilidade.
- **Importação por linha**: validar cada linha do CSV e reportar erros parciais, importando as
  válidas (melhor UX que tudo-ou-nada). Parser de CSV no servidor.
- **Abstração de importação** via interface `ContactImporter` com implementações `CsvImporter`
  e `ErpMgImporter` (placeholder) — OCP, pronto para o futuro.
- **Busca instantânea**: filtragem no servidor com índices (definidos no schema) e debounce no
  cliente; TanStack Query para cache. KISS antes de adotar busca full-text.
- **Schemas Zod** compartilhados entre form (cliente) e validação (servidor) — DRY.

## Risks / Trade-offs

- [CSV malformado/encoding] → validação e mensagens claras; normalização de encoding.
- [Volume grande de contatos na busca] → paginação e índices; evoluir para full-text se preciso.
- [Importação ERP futura pode mudar contrato] → interface estável isola o impacto.

## Migration Plan

1. Schemas Zod + repositories + services de contato.
2. Actions + telas de CRUD em `src/features/contacts`.
3. Importação CSV + interface de importação (placeholder ERP).
4. Grupos/tags + busca/filtros.
Rollback: feature isolada; remover rotas/feature não afeta outros módulos.

## Open Questions

- Formato/colunas oficiais do CSV e do contrato do ERP MG — confirmar com o time.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`.
- É pré-requisito de: `campaigns`; consumido por `dashboard`.
