## ADDED Requirements

### Requirement: CRUD de templates com tipo
O sistema SHALL permitir criar, editar, excluir e listar templates, cada um com um
`TemplateType` (`Novidade`, `Promocao`, `Produto`, `Geral`), validando entradas e respeitando RBAC.

#### Scenario: Criar template
- **WHEN** um usuário com permissão cria um template com tipo válido
- **THEN** o template é persistido e aparece na listagem

#### Scenario: Tipo inválido é rejeitado
- **WHEN** um template é enviado com tipo fora do enum
- **THEN** a operação é rejeitada com mensagem clara

#### Scenario: Visualizador não edita
- **WHEN** um usuário `Visualizador` tenta editar um template
- **THEN** a ação é negada (403)
