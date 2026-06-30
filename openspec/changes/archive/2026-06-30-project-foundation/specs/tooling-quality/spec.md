## ADDED Requirements

### Requirement: Lint e formatação padronizados
O sistema SHALL configurar ESLint e Prettier com scripts (`lint`, `format`) e regras
consistentes para TypeScript/React.

#### Scenario: Lint detecta violações
- **WHEN** o script de lint é executado sobre código que viola as regras
- **THEN** o ESLint reporta os erros correspondentes

### Requirement: Runner de testes configurado
O sistema SHALL configurar Vitest com Testing Library e um script `test`, incluindo ao menos
um smoke test que valide o ambiente de testes.

#### Scenario: Smoke test passa
- **WHEN** o script `test` é executado em uma instalação limpa
- **THEN** o smoke test inicial passa, confirmando que o runner está operacional

#### Scenario: Renderização de componente em teste
- **WHEN** um teste renderiza um componente simples com Testing Library
- **THEN** o teste consegue consultar o DOM renderizado e fazer asserções
