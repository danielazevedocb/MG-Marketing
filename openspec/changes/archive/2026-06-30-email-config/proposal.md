## Why

O envio por email depende de um provedor configurado. É necessário um módulo de configuração que
permita cadastrar múltiplos provedores (SMTP/Resend/SendGrid/SES/Mailgun/Postmark), selecionar o
ativo, testar a conexão e armazenar credenciais com segurança (criptografadas).

## What Changes

- Cadastro de provedores de email com seus campos específicos (SMTP: nome do remetente, email, host, porta, usuário, senha, SSL/TLS).
- Seleção do provedor ativo.
- Botão "Testar conexão" que valida as credenciais sem enviar campanha.
- Criptografia das credenciais do provedor em repouso.

## Capabilities

### New Capabilities
- `provider-config`: CRUD de provedores de email e seleção do provedor ativo.
- `provider-credentials`: criptografia/decriptografia segura das credenciais no servidor.
- `connection-test`: verificação de conexão/credenciais do provedor.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria feature/área de configurações em `src/features/settings`, actions, services (provedor + cripto), repository e schemas.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`.
- É pré-requisito de `sending` (envio de email usa o provedor ativo).
