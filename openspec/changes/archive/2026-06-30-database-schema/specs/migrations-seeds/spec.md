## ADDED Requirements

### Requirement: Migrations versionadas
O sistema SHALL gerar migrations versionadas que reflitam o schema e possam ser aplicadas de
forma reproduzível em ambientes limpos.

#### Scenario: Migration inicial aplica
- **WHEN** as migrations são aplicadas em um banco vazio
- **THEN** todas as tabelas, enums, índices e constraints são criados sem erro

### Requirement: Seeds idempotentes
O sistema SHALL prover um seed que popule dados iniciais (ex.: usuário administrador, tags e
grupos de exemplo) de forma idempotente.

#### Scenario: Seed executado duas vezes
- **WHEN** o seed é executado mais de uma vez
- **THEN** não há duplicação de registros nem erro (upsert/idempotência)
