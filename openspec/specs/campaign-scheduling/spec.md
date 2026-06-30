# campaign-scheduling Specification

## Purpose
TBD - created by archiving change scheduling. Update Purpose after archive.
## Requirements
### Requirement: Agendar campanha
O sistema SHALL permitir agendar uma campanha para uma data/hora futura, definindo o status
`scheduled` e validando que a data é no futuro.

#### Scenario: Agendamento válido
- **WHEN** o usuário agenda uma campanha para um horário futuro
- **THEN** a campanha fica com status `scheduled` e a data/hora é registrada

#### Scenario: Data no passado é rejeitada
- **WHEN** o usuário tenta agendar para uma data/hora no passado
- **THEN** a operação é rejeitada com mensagem clara

### Requirement: Cancelar e reagendar
O sistema SHALL permitir cancelar um agendamento (voltando a `draft`) e reagendar para outra
data/hora.

#### Scenario: Cancelar agendamento
- **WHEN** o usuário cancela um agendamento pendente
- **THEN** a campanha deixa de estar agendada e não será enviada automaticamente

#### Scenario: Reagendar
- **WHEN** o usuário altera a data/hora de uma campanha agendada
- **THEN** o novo horário é registrado e o anterior é descartado

