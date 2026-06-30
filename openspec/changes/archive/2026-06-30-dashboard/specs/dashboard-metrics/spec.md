## ADDED Requirements

### Requirement: Indicadores agregados
O sistema SHALL calcular e expor indicadores: total de campanhas por status
(criadas/enviadas/agendadas/rascunho), total de templates, total de contatos e envios do dia.

#### Scenario: Cálculo dos indicadores
- **WHEN** o dashboard é carregado
- **THEN** os indicadores refletem corretamente as contagens atuais do banco

#### Scenario: Envios do dia
- **WHEN** ocorrem envios no dia corrente
- **THEN** o indicador de envios do dia é atualizado de acordo

### Requirement: Séries para gráficos
O sistema SHALL fornecer séries temporais (ex.: envios por período) para alimentar os gráficos.

#### Scenario: Série por período
- **WHEN** o dashboard solicita a série de envios dos últimos dias
- **THEN** o sistema retorna os pontos agregados por dia para o período pedido
