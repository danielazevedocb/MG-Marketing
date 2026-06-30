## ADDED Requirements

### Requirement: Busca global
O sistema SHALL oferecer uma busca global que localize entidades (campanhas, templates,
contatos) e ações, respeitando o RBAC do usuário.

#### Scenario: Buscar entidade
- **WHEN** o usuário digita um termo na busca global
- **THEN** resultados relevantes de diferentes módulos são exibidos agrupados

#### Scenario: Resultados respeitam permissão
- **WHEN** um usuário sem acesso a um recurso faz uma busca
- **THEN** itens aos quais ele não tem acesso não aparecem nos resultados

### Requirement: Command Menu (Ctrl+K)
O sistema SHALL prover um Command Menu acionado por `Ctrl+K` para navegação rápida e execução
de ações.

#### Scenario: Abrir com atalho
- **WHEN** o usuário pressiona `Ctrl+K`
- **THEN** o Command Menu abre e permite navegar/executar ações por teclado

#### Scenario: Navegação por teclado
- **WHEN** o usuário navega pelos itens com as setas e confirma com Enter
- **THEN** a ação/navegação selecionada é executada
