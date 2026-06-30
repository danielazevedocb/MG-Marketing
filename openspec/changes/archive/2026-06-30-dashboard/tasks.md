## 1. Agregação de dados

- [x] 1.1 Implementar service de indicadores (campanhas por status, templates, contatos, envios do dia)
- [x] 1.2 Implementar service de séries temporais (envios por período) com count/groupBy
- [x] 1.3 Implementar consultas de últimos envios e campanhas agendadas

## 2. Visões e UI

- [x] 2.1 Criar componentes em `src/components/dashboard` (cards de indicador, timeline, listas)
- [x] 2.2 Integrar Magic UI (Magic Card, Number Ticker, Blur Fade) respeitando `prefers-reduced-motion`
- [x] 2.3 Implementar gráficos (biblioteca leve) com tema light/dark
- [x] 2.4 Montar a tela do dashboard com seções, skeletons e estados vazios

## 3. Testes

- [x] 3.1 Teste: indicadores refletem as contagens corretas (com dados de teste)
- [x] 3.2 Teste: série temporal agrega envios por dia corretamente
- [x] 3.3 Teste: últimos envios e agendadas retornam os registros esperados
- [x] 3.4 Teste: estado vazio é exibido quando não há dados
- [x] 3.5 Teste: animações respeitam `prefers-reduced-motion`
