## Why

Para criar campanhas em minutos de forma padronizada, o sistema precisa de templates
reutilizáveis. Um módulo de templates permite criar, organizar, favoritar, duplicar e
pré-visualizar modelos de conteúdo, acelerando a criação de campanhas consistentes.

## What Changes

- CRUD de templates com tipos (`Novidade`, `Promocao`, `Produto`, `Geral`).
- Favoritar e duplicar templates.
- Busca e categorização por tipo.
- Pré-visualização (preview) do template.
- Editor visual de template (sem edição de HTML cru pelo usuário).

## Capabilities

### New Capabilities
- `template-crud`: criar, editar, excluir e listar templates com tipo e validação.
- `template-actions`: favoritar, duplicar, buscar e categorizar templates.
- `template-editor`: editor visual e pré-visualização do template.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria feature `src/features/templates`, actions, services, repositories, schemas e componentes de editor/preview.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`, `file-storage` (imagens).
- É pré-requisito de `campaigns` (seleção de template) e relacionado a `preview`.
