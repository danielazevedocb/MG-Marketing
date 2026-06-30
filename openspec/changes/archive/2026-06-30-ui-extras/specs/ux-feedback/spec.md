## ADDED Requirements

### Requirement: Toasts e autosave
O sistema SHALL exibir toasts consistentes para feedback de ações e SHALL aplicar autosave em
formulários longos (ex.: wizard de campanhas), preservando o trabalho do usuário.

#### Scenario: Feedback de ação
- **WHEN** uma ação relevante é concluída (ex.: salvar)
- **THEN** um toast claro confirma o resultado (sucesso/erro)

#### Scenario: Autosave preserva trabalho
- **WHEN** o usuário edita um formulário longo e há pausa/saída
- **THEN** o conteúdo é salvo automaticamente e pode ser retomado

### Requirement: Estados de carregamento e vazio
O sistema SHALL usar skeleton loading e empty states consistentes, preservando o layout durante
o carregamento.

#### Scenario: Skeleton durante carregamento
- **WHEN** uma lista está carregando
- **THEN** skeletons são exibidos sem causar "pulos" de layout

#### Scenario: Empty state
- **WHEN** uma lista não tem itens
- **THEN** um empty state com orientação/ação é exibido

### Requirement: Favoritos consistentes
O sistema SHALL prover um padrão de favoritos transversal (ex.: templates/campanhas) com estado
persistido por usuário.

#### Scenario: Favoritar item
- **WHEN** o usuário favorita um item
- **THEN** o estado é persistido e refletido nas listagens e na busca
