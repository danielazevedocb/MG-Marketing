## Context

Os modelos `Campaign`, `CampaignField` e enums já existem; contatos e templates estão prontos.
Esta change implementa o fluxo central de campanhas (wizard), o conteúdo e os rascunhos. Não
realiza o envio (delegado a `sending`/`scheduling`) nem o preview dual (delegado a `preview`).

## Goals / Non-Goals

**Goals:**
- Wizard multi-etapas com estado persistível e validação por etapa.
- Todos os campos de conteúdo + mídia.
- Rascunho e duplicação.

**Non-Goals:**
- Não envia nem agenda (apenas registra canal e estado).
- Não gera HTML/mensagem final (fica em `sending`).

## Decisions

- **Wizard como máquina de etapas** com estado validado por Zod a cada passo; persistência
  incremental como rascunho (status `draft`). Alternativa (form único gigante) rejeitada por UX.
- **Reuso de contatos e templates** via seus services/repositories — DRY; campanha referencia
  template e destinatários.
- **`CampaignField` separado**: conteúdo flexível e evolutivo sem alterar `Campaign` (OCP).
- **Camadas** actions → services → repositories; schemas Zod compartilhados cliente/servidor.
- **Estado do wizard** no cliente (RHF + Zod) com autosave de rascunho no servidor.

## Risks / Trade-offs

- [Complexidade do wizard] → dividir etapas em componentes pequenos (SRP) e testar transições.
- [Consistência rascunho ↔ envio] → status (`draft`/`scheduled`/`sent`) como fonte da verdade.
- [Mudança de template após seleção] → snapshot do conteúdo na campanha para evitar quebra.

## Migration Plan

1. Schemas + repository + service de campanha.
2. Wizard (etapas) + telas em `src/features/campaigns`.
3. Campos de conteúdo + integração de upload e seleção de contatos/grupos/template.
4. Rascunho (autosave) + duplicação.
Rollback: feature isolada.

## Open Questions

- Snapshot vs. referência viva do template — decidir na implementação (preferência: snapshot).

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`, `file-storage`, `contacts`, `templates`.
- É pré-requisito de: `preview`, `sending`, `scheduling`; consumido por `dashboard`, `history-logs`.
