# audit-logs Specification

## Purpose
TBD - created by archiving change history-logs. Update Purpose after archive.
## Requirements
### Requirement: Registro de auditoria
O sistema SHALL registrar logs de auditoria para operações relevantes (criar/editar/excluir,
enviar, configurar), incluindo ator, ação, entidade afetada e timestamp.

#### Scenario: Operação gera log
- **WHEN** um usuário executa uma operação relevante (ex.: excluir contato)
- **THEN** um `AuditLog` é criado com ator, ação, entidade e timestamp

### Requirement: Consulta de auditoria
O sistema SHALL permitir consultar e filtrar os logs de auditoria, restrito a perfis
autorizados.

#### Scenario: Acesso restrito
- **WHEN** um usuário sem permissão tenta acessar os logs de auditoria
- **THEN** o acesso é negado (403)

#### Scenario: Filtrar auditoria
- **WHEN** um usuário autorizado filtra por ator e período
- **THEN** apenas os logs correspondentes são exibidos

