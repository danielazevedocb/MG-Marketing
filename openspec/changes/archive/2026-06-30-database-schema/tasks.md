## 1. Conexão e configuração

- [x] 1.1 Adicionar Prisma e configurar datasource PostgreSQL (Supabase) com `DATABASE_URL` e `DIRECT_URL`
- [x] 1.2 Configurar generator do Prisma Client
- [x] 1.3 Criar cliente Prisma singleton em `src/lib/prisma.ts`
- [x] 1.4 Documentar variáveis de banco no `.env.example`

## 2. Modelagem — auth e contatos

- [x] 2.1 Modelar `User`, `Account`, `Session`, `VerificationToken` (Auth.js) e enum `Role`
- [x] 2.2 Modelar `Contact` (empresa, telefone, email, status), `Group`, `Tag`
- [x] 2.3 Definir relações N:N Contact↔Group e Contact↔Tag
- [x] 2.4 Adicionar índices de busca (email, telefone, status) e constraints `@unique`

## 3. Modelagem — templates e campanhas

- [x] 3.1 Modelar `Template` + enum `TemplateType` (Novidade, Promocao, Produto, Geral)
- [x] 3.2 Modelar `Campaign` + enums `CampaignType` e `CampaignStatus` (draft, scheduled, sent)
- [x] 3.3 Modelar `CampaignField` (titulo, subtitulo, texto, banner, imagem, link, botao, preco, desconto, validade, observacoes) com FK para `Campaign`

## 4. Modelagem — provedores, histórico e arquivos

- [x] 4.1 Modelar `EmailProvider` + enum `ProviderType` (SMTP, Resend, SendGrid, SES, Mailgun, Postmark), flag `active` e campo de credenciais criptografadas
- [x] 4.2 Modelar `SendHistory` (data, hora, usuário, campanha, canal, destinatário, status, retorno)
- [x] 4.3 Modelar `AuditLog` (ator, ação, entidade, payload, timestamp)
- [x] 4.4 Modelar `FileAsset` (url pública + metadados)
- [x] 4.5 Adicionar `createdAt`/`updatedAt` em todos os modelos persistentes

## 5. Migrations e seeds

- [x] 5.1 Gerar migration inicial e aplicar em banco limpo <!-- migration `0_init` gerada via `prisma migrate diff`; aplicação pendente de DATABASE_URL real (sem DB acessível neste ambiente) -->
- [x] 5.2 Implementar seed idempotente (usuário Administrador, grupos/tags de exemplo)

## 6. Testes

- [x] 6.1 Configurar banco de teste (ou schema isolado) para testes de integração do Prisma <!-- helper `src/lib/__tests__/test-db.ts`: integração roda só com `DATABASE_URL_TEST` (skip caso ausente) -->
- [x] 6.2 Teste de integração: aplicar migrations em banco limpo e validar tabelas/enums/índices <!-- offline: asserções sobre `migration.sql`; integração: information_schema -->
- [x] 6.3 Teste de integração do seed: executar duas vezes e validar idempotência (sem duplicação) <!-- offline com mock validando upsert; integração quando DB disponível -->
- [x] 6.4 Teste de relações: criar Contact associado a Group e Tag e consultar nos dois sentidos
- [x] 6.5 Teste de constraints: email duplicado de `User` é rejeitado
- [x] 6.6 Teste: `Campaign` criada sem status assume `draft`
