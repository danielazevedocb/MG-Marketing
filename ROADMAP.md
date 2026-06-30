# MG Marketing — Roadmap de Desenvolvimento (OpenSpec)

Aplicação web interna (single-org, sem multi-tenancy) para os times Comercial e Marketing
criarem, gerenciarem, agendarem e enviarem campanhas via WhatsApp e Email de forma rápida e
padronizada.

Cada item abaixo é uma **change** do OpenSpec (schema `spec-driven`) com artefatos completos:
`proposal.md` (o quê/por quê), `specs/**/spec.md` (requisitos testáveis), `design.md` (como) e
`tasks.md` (passos de implementação, **incluindo seção de testes**). Conteúdo em pt-BR.

Implementar **nesta ordem** (cada change depende das anteriores indicadas):

| # | Change | Escopo | Depende de |
|---|--------|--------|------------|
| 1 | `project-foundation` | Scaffold Next.js 15/React 19/TS, Tailwind v4, shadcn/Magic UI/Framer/Lucide, Next Themes, TanStack Query, ESLint/Prettier, estrutura de pastas, Vitest + smoke test | — |
| 2 | `database-schema` | Prisma + Supabase PostgreSQL; modelos (User/Auth, Contact/Group/Tag, Template, Campaign/CampaignField, EmailProvider, SendHistory, AuditLog, FileAsset) + enums, migrations, seeds, índices | 1 |
| 3 | `auth-rbac` | Auth.js + Prisma Adapter; login/sessão; RBAC 4 perfis; middleware e guardas de rotas/actions | 1, 2 |
| 4 | `file-storage` | Cloudflare R2; upload Drag & Drop; só URL+metadados no banco; otimização de imagens | 1, 2, 3 |
| 5 | `contacts` | CRUD; CSV import; abstração ERP MG; busca instantânea; filtros; grupos; tags | 1, 2, 3 |
| 6 | `templates` | CRUD; favoritar; duplicar; busca; categorias; editor visual; preview | 1, 2, 3, 4 |
| 7 | `campaigns` | Wizard (criar→tipo→template→conteúdo→imagem→contatos→grupos→canal→preview→enviar/agendar); rascunho; duplicar | 1–6 |
| 8 | `preview` | Preview dual em tempo real (WhatsApp esquerda, Email direita) | 1, 7 (compartilha com 10) |
| 9 | `email-config` | Provedores (SMTP/Resend/SendGrid/SES/Mailgun/Postmark); ativo; testar conexão; credenciais criptografadas | 1, 2, 3 |
| 10 | `sending` | WhatsApp via `wa.me` (auto-formatação); Email HTML gerado; seleção de canal; registro em histórico | 1–7, 9 |
| 11 | `scheduling` | Agendar/cancelar/reagendar; runner idempotente; integra envio + histórico | 1–3, 7, 10 |
| 12 | `history-logs` | Histórico de envios; logs de auditoria; filtros; exportação CSV | 1–3, 10 |
| 13 | `dashboard` | Indicadores; timeline; últimos envios; agendadas; gráficos; cards animados (Magic UI) | 1–12 |
| 14 | `ui-extras` | Busca global; Command Menu (Ctrl+K); toasts; autosave; favoritos; lazy/skeleton; empty states; performance | 1 (+ módulos de dados) |

## Fluxo por change (apply)

Para implementar uma change use o workflow OpenSpec:

1. `openspec status --change "<nome>" --json`
2. `openspec instructions apply --change "<nome>" --json`
3. Ler os `contextFiles` (proposal/specs/design/tasks) e implementar tarefa por tarefa, marcando `- [ ]` → `- [x]`.
4. Ao concluir: `openspec archive <nome>`.

**Próximo passo:** implementar `project-foundation` via o workflow de apply.
