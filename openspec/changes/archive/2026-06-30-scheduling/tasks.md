## 1. Agendamento

- [x] 1.1 Adicionar/validar campo de data/hora de agendamento na campanha (armazenar em UTC)
- [x] 1.2 Implementar service de agendar (status `scheduled`) com validação de data futura
- [x] 1.3 Implementar cancelar (volta a `draft`) e reagendar
- [x] 1.4 Telas/controles de agendamento integrados ao wizard/lista de campanhas

## 2. Execução

- [x] 2.1 Implementar Route Handler protegido (runner) que busca campanhas vencidas
- [x] 2.2 Garantir idempotência via lock/transição de status
- [x] 2.3 Reutilizar o módulo `sending` para o disparo e atualizar status para `sent`
- [x] 2.4 Registrar o resultado em `SendHistory`
- [x] 2.5 Configurar cron no ambiente de deploy para acionar o runner

## 3. Testes

- [x] 3.1 Teste: agendamento com data futura define `scheduled`; data no passado é rejeitada
- [x] 3.2 Teste: cancelar volta a `draft`; reagendar atualiza o horário
- [x] 3.3 Teste: runner dispara campanhas vencidas via `sending` (mock) e marca `sent`
- [x] 3.4 Teste de idempotência: reprocessar a mesma campanha não duplica envio
- [x] 3.5 Teste: resultado da execução é registrado em `SendHistory`
