## ADDED Requirements

### Requirement: Favoritar e duplicar templates
O sistema SHALL permitir marcar templates como favoritos e duplicar um template existente em um
novo registro editável.

#### Scenario: Favoritar template
- **WHEN** o usuário marca um template como favorito
- **THEN** o estado de favorito é persistido e o template aparece nos favoritos

#### Scenario: Duplicar template
- **WHEN** o usuário duplica um template
- **THEN** um novo template é criado com o mesmo conteúdo e nome distinto, sem alterar o original

### Requirement: Busca e categorização
O sistema SHALL permitir buscar templates e filtrá-los por tipo/categoria.

#### Scenario: Filtrar por tipo
- **WHEN** o usuário filtra por `Promocao`
- **THEN** apenas templates desse tipo são listados

#### Scenario: Busca por termo
- **WHEN** o usuário digita um termo de busca
- **THEN** a lista é filtrada pelos campos pesquisáveis do template
