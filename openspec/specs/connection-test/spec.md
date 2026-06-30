# connection-test Specification

## Purpose
TBD - created by archiving change email-config. Update Purpose after archive.
## Requirements
### Requirement: Testar conexão do provedor
O sistema SHALL oferecer a ação "Testar conexão" que valida as credenciais/conexão do provedor
no servidor, sem enviar uma campanha real.

#### Scenario: Conexão bem-sucedida
- **WHEN** o usuário aciona "Testar conexão" com credenciais válidas
- **THEN** o sistema confirma sucesso com feedback claro

#### Scenario: Conexão falha
- **WHEN** as credenciais/conexão são inválidas
- **THEN** o sistema reporta a falha com mensagem útil, sem expor detalhes sensíveis

