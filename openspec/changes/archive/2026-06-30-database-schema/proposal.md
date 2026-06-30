## Why

Todos os módulos de negócio (auth, contatos, templates, campanhas, envios, histórico) dependem
de um modelo de dados consistente e bem relacionado. É necessário definir o schema Prisma
completo sobre o Supabase PostgreSQL, com migrations, seeds, índices e constraints, antes de
implementar funcionalidades que persistem dados.

## What Changes

- Configurar Prisma ORM com conexão ao Supabase PostgreSQL (apenas o banco).
- Modelar entidades centrais: `User`, `Account`, `Session`, `VerificationToken` (Auth.js), enum `Role` (Administrador, Marketing, Comercial, Visualizador).
- Domínio de contatos: `Contact`, `Group`, `Tag` (e relações N:N apropriadas).
- Templates: `Template` + enum `TemplateType` (Novidade, Promocao, Produto, Geral).
- Campanhas: `Campaign` + enum `CampaignType`, enum `CampaignStatus` (draft, scheduled, sent), `CampaignField` (titulo, subtitulo, texto, banner, imagem, link, botao, preco, desconto, validade, observacoes).
- Provedores de email: `EmailProvider` + enum `ProviderType` (SMTP, Resend, SendGrid, SES, Mailgun, Postmark), flag `active`, credenciais criptografadas.
- Operação/observabilidade: `SendHistory`, `AuditLog`, `FileAsset` (url pública + metadados).
- Migrations, seeds, índices, relações e constraints (unique/foreign keys).

Esta change define o schema; não implementa telas nem regras de negócio.

## Capabilities

### New Capabilities
- `data-model`: schema Prisma completo (modelos, enums, relações, índices, constraints) do MG Marketing.
- `db-connection`: configuração da conexão Prisma ↔ Supabase PostgreSQL e geração do client.
- `migrations-seeds`: pipeline de migrations e seeds idempotentes para dados iniciais.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria `prisma/schema.prisma`, migrations, `prisma/seed.ts` e o Prisma Client.
- Depende de `project-foundation` (estrutura de pastas, tooling).
- É pré-requisito de: `auth-rbac`, `file-storage`, `contacts`, `templates`, `campaigns`, `email-config`, `sending`, `history-logs`, `dashboard`.
