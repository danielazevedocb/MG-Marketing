# template-editor Specification

## Purpose
TBD - created by archiving change templates. Update Purpose after archive.
## Requirements
### Requirement: Editor visual de template
O sistema SHALL prover um editor visual para compor o conteúdo do template (campos e mídia),
sem exigir que o usuário edite HTML cru.

#### Scenario: Edição visual
- **WHEN** o usuário altera campos no editor visual
- **THEN** o conteúdo do template é atualizado de forma estruturada (sem HTML manual)

### Requirement: Pré-visualização do template
O sistema SHALL exibir uma pré-visualização do template refletindo o conteúdo atual.

#### Scenario: Preview reflete o conteúdo
- **WHEN** o usuário edita um campo do template
- **THEN** a pré-visualização é atualizada para refletir a alteração

