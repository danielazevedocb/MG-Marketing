# authorization-rbac Specification

## Purpose
TBD - created by archiving change auth-rbac. Update Purpose after archive.
## Requirements
### Requirement: Perfis de acesso
O sistema SHALL suportar os perfis `Administrador`, `Marketing`, `Comercial` e `Visualizador`,
com um mapa de permissões que define o que cada perfil pode fazer.

#### Scenario: Visualizador é somente leitura
- **WHEN** um usuário `Visualizador` tenta executar uma ação de escrita
- **THEN** a ação é negada (403) e nenhum dado é alterado

#### Scenario: Administrador tem acesso total
- **WHEN** um usuário `Administrador` executa qualquer ação suportada
- **THEN** a verificação de permissão autoriza a operação

### Requirement: Verificação de permissão no servidor
O sistema SHALL aplicar a verificação de permissão no servidor (fonte da verdade), via helper
reutilizável (ex.: `requireRole`), independentemente de qualquer checagem de UI.

#### Scenario: Permissão insuficiente
- **WHEN** uma Server Action é chamada por um perfil sem permissão para aquela operação
- **THEN** a action lança/retorna 403 antes de tocar a camada de dados

#### Scenario: UI não substitui o servidor
- **WHEN** um controle de UI é ocultado por papel
- **THEN** a operação correspondente ainda é validada no servidor (ocultar é apenas UX)

