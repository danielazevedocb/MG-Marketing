## ADDED Requirements

### Requirement: Grupos e tags
O sistema SHALL permitir criar grupos e tags e associá-los a contatos (N:N), permitindo
organização e segmentação.

#### Scenario: Associar contato a grupo
- **WHEN** um usuário adiciona um contato a um grupo
- **THEN** a associação é persistida e o contato aparece no grupo

#### Scenario: Associar tag a contato
- **WHEN** um usuário aplica uma tag a um contato
- **THEN** a tag fica associada e pode ser usada em filtros

### Requirement: Busca instantânea e filtros
O sistema SHALL oferecer busca instantânea e filtros (status, grupo, tag) sobre a lista de
contatos, com resposta rápida.

#### Scenario: Busca por termo
- **WHEN** o usuário digita um termo na busca
- **THEN** a lista é filtrada em tempo real pelos campos pesquisáveis

#### Scenario: Filtro combinado
- **WHEN** o usuário aplica filtro por status e por tag
- **THEN** apenas contatos que satisfazem ambos os critérios são exibidos
