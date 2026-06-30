# provider-config Specification

## Purpose
TBD - created by archiving change email-config. Update Purpose after archive.
## Requirements
### Requirement: Cadastro de provedores de email
O sistema SHALL permitir cadastrar provedores de email dos tipos SMTP, Resend, SendGrid, SES,
Mailgun e Postmark, com os campos específicos de cada tipo (para SMTP: nome do remetente, email,
host, porta, usuário, senha, SSL/TLS), validados com Zod.

#### Scenario: Cadastrar provedor SMTP
- **WHEN** um Administrador cadastra um provedor SMTP com campos válidos
- **THEN** o provedor é persistido e aparece na lista de provedores

#### Scenario: Campos obrigatórios ausentes
- **WHEN** um provedor é enviado sem campos obrigatórios do seu tipo
- **THEN** a operação é rejeitada com mensagem clara

### Requirement: Seleção do provedor ativo
O sistema SHALL permitir definir qual provedor está ativo, garantindo um único provedor ativo
por vez.

#### Scenario: Trocar provedor ativo
- **WHEN** o usuário marca outro provedor como ativo
- **THEN** o provedor anterior deixa de ser o ativo e o novo passa a ser usado nos envios

