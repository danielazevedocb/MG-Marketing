## Why

Os times precisam de uma visão geral rápida do uso e dos resultados. Um dashboard com
indicadores, timeline de atividades, últimos envios, campanhas agendadas e gráficos dá contexto
imediato ao abrir o sistema, com uma apresentação moderna (Magic UI).

## What Changes

- Indicadores: campanhas criadas/enviadas/agendadas/rascunho, templates, contatos, envios do dia.
- Timeline de atividade recente.
- Últimos envios e campanhas agendadas.
- Gráficos (séries por período).
- Cards animados (Magic Card, Number Ticker, etc.), respeitando `prefers-reduced-motion`.

## Capabilities

### New Capabilities
- `dashboard-metrics`: agregação dos indicadores a partir dos dados existentes.
- `dashboard-views`: layout do dashboard (indicadores, timeline, últimos envios, agendadas, gráficos) com animações.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria feature `src/features` + `src/components/dashboard`, services de agregação e telas.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`, `campaigns`, `templates`, `contacts`, `sending`, `scheduling`, `history-logs`.
- É leitura/consumo dos demais módulos (não altera seus dados).
