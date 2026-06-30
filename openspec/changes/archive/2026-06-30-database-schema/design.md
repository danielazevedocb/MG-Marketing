## Context

Com a fundação pronta, é necessário o modelo de dados central do MG Marketing. O banco é
Supabase PostgreSQL, acessado exclusivamente via Prisma. O sistema é single-org (sem
`tenantId`). Os modelos de auth seguem o contrato do Prisma Adapter do Auth.js, antecipando a
change `auth-rbac`.

## Goals / Non-Goals

**Goals:**
- Schema Prisma completo, normalizado e relacionado, com índices e constraints.
- Conexão Prisma ↔ Supabase via variáveis de servidor e client singleton.
- Migrations versionadas e seed idempotente.

**Non-Goals:**
- Não implementa lógica de autenticação/RBAC (apenas os modelos), nem upload (apenas `FileAsset`).
- Não cria repositories/services de domínio (ficam nas changes de cada módulo).

## Decisions

- **Prisma como única camada de acesso a dados** (regra do projeto), com client singleton em
  `src/lib/prisma.ts` para evitar excesso de conexões no dev.
- **Modelos de Auth.js antecipados** (`User`, `Account`, `Session`, `VerificationToken`) para
  que `auth-rbac` apenas configure o adapter; evita migration dupla.
- **Enums no banco** para `Role`, `TemplateType`, `CampaignType`, `CampaignStatus`,
  `ProviderType` — garante integridade e legibilidade vs. strings livres.
- **Credenciais de `EmailProvider` criptografadas em repouso**: armazenar payload cifrado
  (chave em env de servidor); a criptografia/serviço fica em `email-config`, mas o schema já
  prevê o campo. Alternativa (texto puro) rejeitada por segurança.
- **Relações N:N de contatos** (Contact↔Group, Contact↔Tag) via tabelas de junção implícitas/
  explícitas do Prisma; índices em campos de busca (email, telefone, status).
- **`CampaignField` separada de `Campaign`**: mantém `Campaign` enxuta e permite evoluir campos
  do conteúdo sem alterar a entidade principal (SRP/OCP).
- **`FileAsset` guarda apenas URL pública + metadados** (R2 é a fonte do binário) — alinhado à
  change `file-storage`.
- **Timestamps padrão** (`createdAt`/`updatedAt`) em todos os modelos persistentes.

## Risks / Trade-offs

- [Pgbouncer/pooling do Supabase pode exigir `DIRECT_URL` para migrations] → configurar
  `DATABASE_URL` (pooled) e `DIRECT_URL` (direta) conforme docs do Supabase/Prisma.
- [Modelo amplo desde o início pode incluir campos não usados de imediato] → aceitável: evita
  múltiplas migrations e suporta a extensibilidade prevista.
- [Criptografia de credenciais] → o schema só reserva o campo; risco real tratado em `email-config`.

## Migration Plan

1. Configurar datasource/generator e variáveis (`DATABASE_URL`, `DIRECT_URL`).
2. Escrever modelos + enums + índices + constraints.
3. Gerar migration inicial e aplicar em banco limpo.
4. Implementar seed idempotente (admin, grupos/tags de exemplo).
Rollback: reverter migration (drop) em ambiente não-produtivo; em produção, migration de reversão dedicada.

## Open Questions

- Estratégia exata de pooling do Supabase (transaction vs session) — confirmar na implementação.

## Dependências entre changes

- Depende de: `project-foundation`.
- É pré-requisito de: `auth-rbac`, `file-storage`, `contacts`, `templates`, `campaigns`, `email-config`, `sending`, `scheduling`, `history-logs`, `dashboard`.
