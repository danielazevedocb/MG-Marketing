## ADDED Requirements

### Requirement: Salvar rascunho
O sistema SHALL permitir salvar a campanha como rascunho (status `draft`) em qualquer etapa,
permitindo retomar depois.

#### Scenario: Salvar e retomar rascunho
- **WHEN** o usuário salva a campanha como rascunho e a reabre depois
- **THEN** o conteúdo e o progresso são restaurados a partir do rascunho

### Requirement: Duplicar campanha
O sistema SHALL permitir duplicar uma campanha existente, gerando uma nova em status `draft`.

#### Scenario: Duplicar campanha
- **WHEN** o usuário duplica uma campanha
- **THEN** uma nova campanha em `draft` é criada com o mesmo conteúdo, sem alterar a original
