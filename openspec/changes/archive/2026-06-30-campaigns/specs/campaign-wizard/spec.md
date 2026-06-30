## ADDED Requirements

### Requirement: Fluxo guiado de criação de campanha
O sistema SHALL conduzir a criação de campanha por etapas: criar → tipo → template → editar
conteúdo → imagem → contatos → grupos → canal → preview → enviar/agendar, validando cada etapa.

#### Scenario: Avançar com etapa válida
- **WHEN** o usuário completa uma etapa com dados válidos e avança
- **THEN** o wizard segue para a próxima etapa preservando o estado anterior

#### Scenario: Bloquear avanço com etapa inválida
- **WHEN** o usuário tenta avançar com dados obrigatórios faltando
- **THEN** o avanço é bloqueado com mensagem clara do que falta

### Requirement: Seleção de destinatários e canal
O sistema SHALL permitir selecionar contatos e/ou grupos como destinatários e escolher o canal
(WhatsApp, Email ou ambos) dentro do wizard.

#### Scenario: Selecionar grupo como destinatário
- **WHEN** o usuário seleciona um grupo na etapa de contatos
- **THEN** os contatos do grupo passam a compor os destinatários da campanha

#### Scenario: Selecionar canal
- **WHEN** o usuário escolhe o canal na etapa correspondente
- **THEN** a campanha registra o canal escolhido para o envio
