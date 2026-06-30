# email-send Specification

## Purpose
TBD - created by archiving change sending. Update Purpose after archive.
## Requirements
### Requirement: HTML de email gerado automaticamente
O sistema SHALL gerar automaticamente um HTML de email moderno (banner, logo, título, texto,
botão, rodapé) a partir do conteúdo da campanha, sem que o usuário edite HTML.

#### Scenario: HTML gerado a partir do conteúdo
- **WHEN** uma campanha com conteúdo é preparada para envio por email
- **THEN** o sistema produz um HTML estruturado e sanitizado com as seções esperadas

### Requirement: Disparo via provedor ativo
O sistema SHALL enviar o email usando o provedor de email ativo (configurado em email-config),
com credenciais decriptadas apenas no servidor.

#### Scenario: Envio com provedor ativo
- **WHEN** existe um provedor ativo e a campanha é enviada por email
- **THEN** o email é despachado via esse provedor e o resultado é registrado

#### Scenario: Sem provedor ativo
- **WHEN** não há provedor ativo configurado
- **THEN** o envio por email é bloqueado com mensagem clara orientando configurar um provedor

