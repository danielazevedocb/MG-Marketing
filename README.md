# MG Marketing

Plataforma web **interna** (single-org, sem multi-tenancy) para os times **Comercial** e **Marketing** da MG criarem, gerenciarem, agendarem e enviarem campanhas por **WhatsApp** e **Email** de forma rápida e padronizada.

O envio de email usa provedores configuráveis (SMTP ou APIs transacionais). O WhatsApp **não usa API oficial** — o sistema gera links `wa.me` com a mensagem pré-preenchida para cada destinatário.

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Estilo | Tailwind CSS v4, Radix UI, Lucide |
| Dados | Prisma 7 + PostgreSQL (Supabase) |
| Auth | Auth.js (NextAuth v5) + JWT + bcrypt |
| Estado / UX | TanStack Query, React Hook Form, Zod |
| Storage | Cloudflare R2 (S3-compatible) |
| Testes | Vitest + Testing Library |
| Email | Nodemailer (SMTP), drivers para Resend, SendGrid, SES, Mailgun, Postmark |

---

## Pré-requisitos

- **Node.js** 20+ (LTS recomendado)
- **npm** (ou compatível)
- **PostgreSQL** — projeto [Supabase](https://supabase.com) com connection strings (pool + direct)
- **Opcional:** conta Cloudflare R2 (upload de imagens em campanhas/templates)
- **Opcional:** provedor de email (SMTP, Resend, SendGrid, Amazon SES, Mailgun ou Postmark)
- **Opcional (produção):** cron externo para campanhas agendadas (ex.: Vercel Cron)

---

## Instalação e configuração inicial

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio> MG-Marketing
cd MG-Marketing
npm install
```

O script `postinstall` executa `prisma generate` automaticamente.

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Edite `.env.local` com os valores do seu ambiente. **Nunca** versione segredos reais.

#### Variáveis principais

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_APP_URL` | Sim | URL pública da app (ex.: `http://localhost:3000`) |
| `DATABASE_URL` | Sim | Connection string com **pool** (Supabase transaction pooler, porta 6543) |
| `DIRECT_URL` | Sim | Connection string **direta** (migrations/seed, porta 5432) |
| `AUTH_SECRET` | Sim | Segredo do Auth.js — gere com `openssl rand -base64 32` |
| `AUTH_URL` | Sim | Mesma base da app (ex.: `http://localhost:3000`) |
| `SEED_ADMIN_PASSWORD` | Dev | Senha do administrador criado pelo seed |
| `SEED_ADMIN_EMAIL` | Não | Email do admin (padrão: `admin@teste.com`) |
| `SEED_ADMIN_NAME` | Não | Nome do admin (padrão: `Administrador MG`) |
| `ENCRYPTION_KEY` | Sim* | Chave AES-256 (base64) para credenciais de email no banco |
| `R2_ACCOUNT_ID` | Não** | ID da conta Cloudflare |
| `R2_ACCESS_KEY_ID` | Não** | Access key do R2 |
| `R2_SECRET_ACCESS_KEY` | Não** | Secret key do R2 |
| `R2_BUCKET_NAME` | Não** | Nome do bucket |
| `R2_PUBLIC_URL` | Não** | URL pública do bucket (custom domain ou `*.r2.dev`) |
| `CRON_SECRET` | Prod*** | Protege `GET/POST /api/cron/schedule-runner` |

\* Obrigatória para salvar/testar provedores de email.  
\** Necessárias apenas para upload de imagens (banner/imagem de campanha).  
\*** Necessária em produção se usar agendamento automático.

> **Supabase:** use `DATABASE_URL` com o pooler (`?pgbouncer=true`) para runtime e `DIRECT_URL` com conexão direta para `db:migrate` e `db:seed`. Codifique caracteres especiais na senha na URL.

---

## Banco de dados

### Aplicar migrations

```bash
npm run db:migrate
```

Em deploy/CI:

```bash
npm run db:migrate:deploy
```

### Popular dados iniciais (seed)

O seed é **idempotente** — pode ser executado várias vezes sem duplicar registros.

```bash
npm run db:seed
```

Cria:

- Usuário **Administrador** (credenciais abaixo)
- Grupos de exemplo: Clientes, Leads, Fornecedores
- Tags de exemplo: VIP, Newsletter, Promoções

#### Credenciais padrão do administrador (desenvolvimento)

| Campo | Valor padrão |
|-------|----------------|
| E-mail | `admin@teste.com` |
| Senha | `Admin@123` |

Sobrescreva com `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME` e `SEED_ADMIN_PASSWORD` no `.env.local` antes do seed.

### Prisma Studio (opcional)

```bash
npm run db:studio
```

---

## Executar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). A raiz (`/`) redireciona para `/dashboard` (autenticado) ou `/login` (visitante).

---

## Primeiro acesso

1. Garanta que migrations e seed foram executados.
2. Abra [http://localhost:3000/login](http://localhost:3000/login).
3. Entre com o e-mail e senha do administrador seed.
4. Após o login, você será redirecionado para o **Dashboard** (`/dashboard`).

---

## Visão geral dos módulos

| Módulo | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/dashboard` | Indicadores, gráficos, últimos envios, campanhas agendadas e timeline |
| Contatos | `/contacts` | CRUD, importação CSV, grupos, tags e busca instantânea |
| Templates | `/templates` | Modelos reutilizáveis com editor visual, favoritos e duplicação |
| Campanhas | `/campaigns` | Listagem, wizard de criação/edição, rascunhos e duplicação |
| Histórico | `/history` | Envios por campanha/canal/status, exportação CSV e logs de auditoria |
| Configurações | `/settings/email` | Provedores de email, ativação e teste de conexão |

Atalho global: **Ctrl+K** abre o menu de busca e navegação rápida.

---

## Passo a passo de uso

### 1. Cadastrar ou importar contatos

**Cadastro manual**

1. Acesse **Contatos** → `/contacts`.
2. Clique em **Novo contato** → `/contacts/new`.
3. Preencha **empresa** (obrigatório), nome, telefone, e-mail, status, grupos e tags.
4. Salve.

**Importação CSV**

1. Em **Contatos**, abra **Importar**.
2. Selecione um arquivo `.csv` com as colunas:

   | Coluna | Descrição |
   |--------|-----------|
   | `empresa` | Nome da empresa (obrigatório) |
   | `telefone` | Telefone com DDD (recomendado para WhatsApp) |
   | `email` | E-mail (obrigatório para envio por email) |
   | `status` | `Ativo` ou `Inativo` |
   | `nome` | Nome do contato |

3. Confirme a importação. Linhas inválidas são reportadas; as válidas são persistidas.

**Grupos e tags**

- Grupos agrupam contatos para seleção em massa nas campanhas.
- Tags organizam e filtram contatos na listagem.
- O seed já cria exemplos; novos grupos/tags podem ser gerenciados na interface de contatos.

> A opção **Importar do ERP MG** existe na UI, mas a integração ainda **não está disponível** — use CSV por enquanto.

### 2. Criar um template (opcional, recomendado)

1. Acesse **Templates** → `/templates`.
2. Clique em **Novo template** → `/templates/new`.
3. Defina nome, categoria (Novidade, Promoção, Produto, Geral) e conteúdo (título, textos, links, imagens etc.).
4. Use o preview para validar a aparência.
5. Salve. Templates podem ser favoritados e duplicados depois.

### 3. Criar uma campanha (wizard — 10 etapas)

1. Acesse **Campanhas** → `/campaigns` → **Nova campanha** → `/campaigns/new`.
2. Percorra o wizard (o progresso é salvo como rascunho):

   | # | Etapa | O que fazer |
   |---|-------|-------------|
   | 1 | **Nome** | Identifique a campanha |
   | 2 | **Tipo** | Novidade, Promoção, Produto ou Geral |
   | 3 | **Template** | Escolha um modelo como ponto de partida (ou pule) |
   | 4 | **Conteúdo** | Edite título, subtítulo, texto, preço, desconto, validade, botão, link etc. |
   | 5 | **Imagens** | Envie banner e imagem complementar (requer R2 configurado) |
   | 6 | **Contatos** | Selecione destinatários individuais |
   | 7 | **Grupos** | Inclua grupos inteiros (união com contatos selecionados) |
   | 8 | **Canal** | Marque **WhatsApp**, **Email** ou **ambos** |
   | 9 | **Revisão** | Preview dual: WhatsApp (esquerda) e Email (direita) |
   | 10 | **Enviar / Agendar** | Envie agora ou defina data/hora futura |

3. Use **Salvar rascunho** a qualquer momento para retomar depois em `/campaigns/[id]/edit`.

### 4. Preview, enviar ou agendar

**Preview (etapa 9)**

- Visualize a mensagem WhatsApp formatada (*negrito*, _itálico_, links) e o HTML do email.
- O preview WhatsApp mostra um link `wa.me` de exemplo.

**Enviar agora (etapa 10)**

- Clique em **Enviar agora** (requer permissão `campaigns:send`).
- **Email:** dispara via provedor ativo; falhas (sem e-mail, provedor inativo) aparecem no histórico.
- **WhatsApp:** gera um link `wa.me` por destinatário e registra no histórico (não abre o WhatsApp automaticamente).

**Agendar**

- Preencha **Agendar envio** com data/hora futura e confirme.
- Campanhas agendadas ficam com status `scheduled`.
- Em produção, configure um cron que chame `POST /api/cron/schedule-runner` com header `Authorization: Bearer <CRON_SECRET>`.

### 5. Consultar histórico

1. Acesse **Histórico** → `/history`.
2. Filtre por campanha, canal (WhatsApp/Email), status (Enviado/Falha) e período.
3. Para envios WhatsApp bem-sucedidos, a coluna de retorno contém o **link `wa.me`** — abra-o para concluir o envio manualmente no WhatsApp Web ou app.
4. Use **Exportar CSV** para baixar os registros filtrados.
5. Administradores também veem **logs de auditoria** na mesma página.

---

## Configurar Email

Rota: **Configurações** → `/settings/email`

> Apenas perfis com `emailConfig:write` (**Administrador**) podem criar, editar, excluir e ativar provedores. **Marketing** pode visualizar; **Comercial** e **Visualizador** não acessam esta tela.

### Passo a passo

1. Faça login como **Administrador**.
2. Acesse `/settings/email`.
3. Clique em **Adicionar provedor**.
4. Escolha o tipo, preencha nome interno, **nome do remetente** e **e-mail do remetente** (`from`).
5. Informe as credenciais conforme o provedor (tabela abaixo).
6. Clique em **Testar conexão** antes de salvar (ou teste um provedor já salvo).
7. Salve o provedor.
8. Na listagem, clique em **Ativar** no provedor desejado — **somente um provedor fica ativo** por vez; campanhas de email usam exclusivamente o ativo.

As credenciais são **criptografadas** no banco com `ENCRYPTION_KEY`. Se perder a chave, será necessário recadastrar os provedores.

### Provedores suportados

| Provedor | Campos necessários | Observações |
|----------|-------------------|-------------|
| **SMTP** | host, porta, usuário, senha, TLS (secure) | Qualquer servidor SMTP (Gmail relay, Office 365, etc.) |
| **Resend** | API key | [resend.com](https://resend.com) |
| **SendGrid** | API key | [sendgrid.com](https://sendgrid.com) |
| **Amazon SES** | Access Key ID, Secret Access Key, região AWS | Domínio/e-mail verificado no SES |
| **Mailgun** | API key, domínio | Domínio configurado no Mailgun |
| **Postmark** | Server Token | Servidor transacional no Postmark |

### Testar conexão

- No formulário (antes de salvar): **Testar conexão** envia um e-mail de teste usando os dados informados.
- Na listagem: botão **Testar** em cada provedor salvo usa as credenciais armazenadas.

### Provedor ativo

- O badge **Ativo** indica qual provedor será usado no envio.
- Campanhas **somente Email** falham se não houver provedor ativo.
- Campanhas **WhatsApp + Email** ainda processam WhatsApp; registros de email sem provedor aparecem como **Falha** no histórico.

---

## Configurar WhatsApp

O MG Marketing **não integra com WhatsApp Business API, Twilio ou similares**. O fluxo é:

1. O sistema monta a mensagem a partir do conteúdo da campanha (formatação `*negrito*`, `_itálico_`, links).
2. Normaliza o telefone do contato para o padrão brasileiro com **DDI 55** (remove máscaras, adiciona `55` quando necessário).
3. Gera um link no formato `https://wa.me/<numero>?text=<mensagem codificada>`.
4. Registra o link no **histórico de envios** com status **Enviado** (link gerado) ou **Falha** (telefone ausente/inválido).

### Formatação automática de número

- Aceita formatos como `(11) 98888-7777`, `11988887777`, `5511988887777`.
- Resultado esperado: 12–13 dígitos começando com `55`.
- Telefone **obrigatório** no contato para WhatsApp; e-mail não é usado neste canal.

### Como concluir o envio

1. Após **Enviar agora** ou execução do agendamento, abra **Histórico**.
2. Localize o registro WhatsApp do destinatário.
3. Copie ou clique no link `wa.me` retornado.
4. O WhatsApp Web/app abrirá a conversa com a mensagem pré-preenchida — confirme o envio manualmente.

### Limitações

- **Sem envio automático em massa** — cada link exige ação humana (política do WhatsApp para links `wa.me`).
- **Sem confirmação de entrega/leitura** — o status reflete apenas geração do link ou erro de validação.
- **Um destinatário por link** — campanhas grandes geram N links no histórico.
- Números inválidos ou ausentes são registrados como **Falha** com motivo (ex.: "Telefone ausente", "Telefone inválido").

Não há tela de configuração de WhatsApp — basta cadastrar telefones válidos nos contatos.

---

## Upload de arquivos (Cloudflare R2)

Imagens de banner e complementares em campanhas/templates usam upload **drag & drop** para o R2. O banco guarda apenas URL pública e metadados.

1. Configure todas as variáveis `R2_*` no `.env.local`.
2. `R2_PUBLIC_URL` deve apontar para o domínio público do bucket.
3. Sem R2 configurado, o upload de imagens falha; o restante da campanha (textos, envio) continua funcionando.

Endpoint interno: `POST /api/files/upload` (autenticado, permissão `files:write`).

---

## Perfis de acesso (RBAC)

Quatro perfis (`Role` no banco):

| Perfil | Resumo |
|--------|--------|
| **Administrador** | Acesso total: usuários, auditoria, configuração de email, envio, escrita em todos os módulos |
| **Marketing** | Contatos, templates, campanhas (incl. envio), histórico, leitura de config. email, upload de arquivos |
| **Comercial** | Contatos, leitura de templates, campanhas (incl. envio), histórico, upload — **sem** editar templates nem config. email |
| **Visualizador** | Somente leitura (contatos, templates, campanhas, histórico, arquivos) — **sem enviar** campanhas |

Permissões verificadas **sempre no servidor** (Server Actions e serviços). Ocultar botões na UI não substitui essa checagem.

---

## Scripts úteis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Desenvolvimento | `npm run dev` | Servidor Next.js em modo dev |
| Build | `npm run build` | Build de produção |
| Produção | `npm run start` | Serve o build |
| Lint | `npm run lint` | ESLint |
| Formatar | `npm run format` | Prettier (write) |
| Verificar formato | `npm run format:check` | Prettier (check) |
| Testes | `npm test` | Vitest (run once) |
| Testes watch | `npm run test:watch` | Vitest em modo watch |
| Prisma generate | `npm run db:generate` | Gera client Prisma |
| Migrations (dev) | `npm run db:migrate` | `prisma migrate dev` |
| Migrations (deploy) | `npm run db:migrate:deploy` | `prisma migrate deploy` |
| Seed | `npm run db:seed` | Dados iniciais idempotentes |
| Prisma Studio | `npm run db:studio` | UI do banco |

---

## Testes

```bash
npm test
```

A suíte cobre schemas, serviços (envio, agendamento, RBAC, email, WhatsApp), actions e componentes críticos. Para desenvolvimento contínuo:

```bash
npm run test:watch
```

---

## Estrutura do projeto

```
MG-Marketing/
├── prisma/
│   ├── schema.prisma      # Modelos e enums
│   ├── seed.ts            # Seed idempotente
│   └── migrations/        # Histórico SQL
├── openspec/              # Specs e roadmap OpenSpec
├── public/
├── src/
│   ├── app/               # Rotas Next.js (App Router)
│   │   ├── api/           # Auth, upload, cron runner
│   │   ├── campaigns/
│   │   ├── contacts/
│   │   ├── dashboard/
│   │   ├── history/
│   │   ├── login/
│   │   ├── settings/email/
│   │   └── templates/
│   ├── actions/           # Server Actions
│   ├── components/        # UI compartilhada e layout
│   ├── features/          # Módulos por domínio (campaigns, contacts, …)
│   ├── generated/prisma/  # Client Prisma gerado
│   ├── hooks/
│   ├── lib/               # Auth, Prisma, permissões, R2, criptografia
│   ├── repositories/      # Acesso a dados
│   ├── schemas/           # Validação Zod
│   └── services/          # Regras de negócio
├── .env.example
├── package.json
└── prisma.config.ts       # Config Prisma CLI (URLs, seed)
```

---

## Agendamento em produção

Campanhas agendadas dependem de um job externo:

```http
POST /api/cron/schedule-runner
Authorization: Bearer <CRON_SECRET>
```

Ou header alternativo: `x-cron-secret: <CRON_SECRET>`.

Configure `CRON_SECRET` no ambiente e agende a chamada a cada minuto (ou intervalo desejado). Sem o runner, campanhas ficam em `scheduled` até a execução manual ou disparo do cron.

---

## Documentação adicional

- Roadmap e escopo das features: [`openspec/ROADMAP.md`](openspec/ROADMAP.md)
- Specs detalhadas por módulo: [`openspec/specs/`](openspec/specs/)

---

## Licença

Projeto interno MG — uso restrito à organização.
