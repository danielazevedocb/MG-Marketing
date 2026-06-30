## Context

Com o envio implementado, esta change adiciona o agendamento: marcar campanhas como `scheduled`
e dispará-las no horário, reutilizando `sending`. Precisa de um mecanismo de execução temporal
(cron/endpoint protegido) e de idempotência.

## Goals / Non-Goals

**Goals:**
- Agendar/cancelar/reagendar campanhas com validação de data futura.
- Runner que dispara no horário, idempotente, registrando histórico.

**Non-Goals:**
- Não reimplementa o envio (reusa `sending`).
- Não implementa fila distribuída complexa (KISS); evoluível depois.

## Decisions

- **Status `scheduled` + campo de data/hora** na campanha como fonte da verdade do agendamento.
- **Runner via Route Handler protegido acionado por cron** (ex.: cron do provedor de deploy/
  Supabase) que busca campanhas vencidas e as envia. Alternativa (worker dedicado) adiada por
  simplicidade; interface permite trocar (OCP).
- **Idempotência por status/lock**: ao iniciar o envio, transicionar o estado para evitar
  processamento duplicado em execuções concorrentes.
- **Reuso de `sending`** para o disparo real (DRY); registro em `SendHistory`.
- **Fuso horário** tratado de forma consistente (armazenar em UTC).

## Risks / Trade-offs

- [Execução duplicada/concorrência] → lock/transição de status idempotente.
- [Confiabilidade do cron] → endpoint protegido + reprocessamento de pendências vencidas.
- [Fuso horário] → padronizar UTC no banco e converter na UI.

## Migration Plan

1. Service de agendamento (agendar/cancelar/reagendar) + validação de data.
2. Runner (Route Handler) protegido + idempotência.
3. Integração com `sending` + registro em `SendHistory`.
4. Configuração de cron no ambiente de deploy.
Rollback: desabilitar runner; agendamentos ficam pendentes sem disparo.

## Open Questions

- Mecanismo de cron definitivo (Vercel Cron, Supabase scheduled functions, etc.) — confirmar no deploy.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`, `campaigns`, `sending`.
- Alimenta: `history-logs`, `dashboard`.
