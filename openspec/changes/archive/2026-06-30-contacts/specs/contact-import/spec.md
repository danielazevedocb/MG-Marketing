## ADDED Requirements

### Requirement: Importação via CSV
O sistema SHALL permitir importar contatos a partir de um arquivo CSV, validando linhas e
reportando erros por linha sem abortar todo o lote indevidamente.

#### Scenario: Importação de CSV válido
- **WHEN** um usuário importa um CSV com colunas válidas
- **THEN** os contatos são criados e um resumo (importados/ignorados) é exibido

#### Scenario: Linhas inválidas são reportadas
- **WHEN** o CSV contém linhas com dados inválidos
- **THEN** as linhas inválidas são reportadas e as válidas são importadas

### Requirement: Abstração de importação do ERP MG
O sistema SHALL prover uma abstração (interface) para importação de contatos do ERP MG,
preparada para integração futura, com implementação placeholder.

#### Scenario: Interface de importação disponível
- **WHEN** a importação do ERP MG é acionada na implementação placeholder
- **THEN** o sistema usa a interface definida sem quebrar, sinalizando que a integração real é futura
