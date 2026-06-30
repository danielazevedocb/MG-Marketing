## ADDED Requirements

### Requirement: Seleção e orquestração de canal
O sistema SHALL permitir enviar por WhatsApp, Email ou ambos, orquestrando o disparo conforme o
canal selecionado na campanha.

#### Scenario: Envio por ambos os canais
- **WHEN** a campanha tem canal "ambos"
- **THEN** o sistema processa tanto o WhatsApp quanto o Email para os destinatários

### Requirement: Registro de envio no histórico
O sistema SHALL registrar cada envio em `SendHistory` com data, hora, usuário, campanha, canal,
destinatário, status e mensagem de retorno.

#### Scenario: Registro de sucesso e falha
- **WHEN** um envio é processado (com sucesso ou falha)
- **THEN** um registro de `SendHistory` é criado com o status e o retorno correspondentes

#### Scenario: Atualização de status da campanha
- **WHEN** o envio de uma campanha é concluído
- **THEN** a campanha tem seu status atualizado para `sent`
