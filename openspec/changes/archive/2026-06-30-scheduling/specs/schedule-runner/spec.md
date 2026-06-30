## ADDED Requirements

### Requirement: Execução no horário agendado
O sistema SHALL executar o envio das campanhas agendadas quando o horário chega, reutilizando o
módulo de envio, de forma idempotente (sem envio duplicado).

#### Scenario: Disparo no horário
- **WHEN** o horário agendado de uma campanha é atingido e o runner é acionado
- **THEN** a campanha é enviada via o módulo `sending` e seu status passa a `sent`

#### Scenario: Idempotência do runner
- **WHEN** o runner processa a mesma campanha agendada mais de uma vez
- **THEN** o envio não é duplicado (proteção por status/lock)

### Requirement: Registro do resultado
O sistema SHALL registrar o resultado da execução agendada no histórico (`SendHistory`).

#### Scenario: Histórico após execução
- **WHEN** uma campanha agendada é executada
- **THEN** os envios são registrados em `SendHistory` com seus status/retornos
