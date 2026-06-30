## Why

Rastreabilidade e auditoria são essenciais para um sistema interno. É necessário um módulo que
exponha o histórico de envios e os logs de auditoria de todas as operações, com filtros e
exportação, dando visibilidade e accountability aos times.

## What Changes

- Histórico de envios: data, hora, usuário, campanha, canal, destinatário, status e mensagem de retorno.
- Logs de auditoria de todas as operações relevantes (criação/edição/exclusão/envio/config).
- Filtros (por período, canal, status, usuário, campanha) e exportação (ex.: CSV).

## Capabilities

### New Capabilities
- `send-history`: consulta, filtro e exportação do histórico de envios.
- `audit-logs`: registro e consulta de logs de auditoria das operações do sistema.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria feature `src/features/history`, services/repositories de leitura, helper de auditoria reutilizável e exportação.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`, `sending` (gera histórico) e demais módulos (geram auditoria).
- Consumido por `dashboard` (últimos envios, atividade).
