# dashboard-views Specification

## Purpose
TBD - created by archiving change dashboard. Update Purpose after archive.
## Requirements
### Requirement: Layout do dashboard
O sistema SHALL apresentar indicadores, timeline de atividade, últimos envios, campanhas
agendadas e gráficos em um layout coeso e responsivo, com tema light/dark.

#### Scenario: Render do dashboard
- **WHEN** um usuário autenticado abre o dashboard
- **THEN** as seções (indicadores, timeline, últimos envios, agendadas, gráficos) são exibidas

### Requirement: Animações com performance e acessibilidade
O sistema SHALL usar componentes animados (Magic Card, Number Ticker, etc.) respeitando
`prefers-reduced-motion` e sem prejudicar a performance.

#### Scenario: Reduzir movimento
- **WHEN** o usuário tem `prefers-reduced-motion` ativo
- **THEN** as animações dos cards são reduzidas ou desativadas

#### Scenario: Estado vazio
- **WHEN** ainda não há dados (ex.: nenhum envio)
- **THEN** o dashboard mostra estados vazios claros em vez de seções quebradas

