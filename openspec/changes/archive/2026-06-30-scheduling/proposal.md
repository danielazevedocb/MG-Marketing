## Why

Os times precisam programar campanhas para horários estratégicos. É necessário permitir agendar
o envio de uma campanha para o futuro, integrando-se ao módulo de envio e ao histórico.

## What Changes

- Agendar campanha para data/hora futura (status `scheduled`).
- Executar o envio automaticamente no horário agendado, reutilizando o módulo `sending`.
- Cancelar/reagendar agendamentos.
- Registrar o resultado no histórico após a execução.

## Capabilities

### New Capabilities
- `campaign-scheduling`: agendar, cancelar e reagendar campanhas com data/hora futura.
- `schedule-runner`: execução do envio no horário agendado e atualização de status/histórico.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria service de agendamento, mecanismo de execução (Route Handler/cron) e integração com `sending` e `SendHistory`.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`, `campaigns`, `sending`.
- Alimenta `history-logs` e `dashboard` (campanhas agendadas).
