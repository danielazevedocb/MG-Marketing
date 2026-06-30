# send-history Specification

## Purpose
TBD - created by archiving change history-logs. Update Purpose after archive.
## Requirements
### Requirement: Consulta do histórico de envios
O sistema SHALL exibir o histórico de envios com data, hora, usuário, campanha, canal,
destinatário, status e mensagem de retorno, respeitando o RBAC.

#### Scenario: Listar envios
- **WHEN** um usuário com permissão abre o histórico
- **THEN** a lista de envios é exibida com todas as colunas previstas

### Requirement: Filtros e exportação
O sistema SHALL permitir filtrar o histórico (período, canal, status, usuário, campanha) e
exportar o resultado filtrado (ex.: CSV).

#### Scenario: Filtrar por período e canal
- **WHEN** o usuário filtra por um intervalo de datas e canal WhatsApp
- **THEN** apenas os envios correspondentes são exibidos

#### Scenario: Exportar resultado
- **WHEN** o usuário exporta o histórico filtrado
- **THEN** um arquivo (ex.: CSV) é gerado com exatamente os registros filtrados

