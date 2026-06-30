## Why

Campanhas precisam de destinatários. É necessário um módulo de contatos completo para cadastrar,
importar, buscar, filtrar e organizar contatos por grupos e tags, servindo de base para a
seleção de destinatários nas campanhas.

## What Changes

- CRUD de contatos (criar, listar, editar, excluir) com campos empresa, telefone, email, status.
- Criação manual e importação via CSV.
- Importação do ERP MG como abstração/placeholder (interface preparada para o futuro).
- Busca instantânea e filtros (por status, grupo, tag, etc.).
- Gestão de grupos e tags e associação a contatos.

## Capabilities

### New Capabilities
- `contact-crud`: operações CRUD de contatos com validação e permissão.
- `contact-import`: importação via CSV e abstração de importação do ERP MG.
- `contact-organization`: grupos, tags, busca instantânea e filtros.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria feature `src/features/contacts`, actions, services, repositories e schemas de contato.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`.
- É pré-requisito de `campaigns` (seleção de destinatários) e usado por `dashboard` (indicadores).
