## Context

Com campanhas, contatos e provedor de email prontos, esta change implementa o envio efetivo:
WhatsApp via link `wa.me` e Email via HTML gerado automaticamente, com seleção de canal e
registro em `SendHistory`. Compartilha as funções de geração com `preview`.

## Goals / Non-Goals

**Goals:**
- Geração de link `wa.me` por destinatário com auto-formatação.
- Geração de HTML moderno de email e disparo via provedor ativo.
- Orquestração por canal e registro de cada envio no histórico.

**Non-Goals:**
- Não implementa agendamento (fica em `scheduling`).
- Não usa WhatsApp Business API (apenas `wa.me`); extensível no futuro.

## Decisions

- **WhatsApp via `wa.me`**: simples e sem API paga; o link abre a conversa com a mensagem
  pré-preenchida. Número normalizado para DDI 55; mensagem URL-encoded. Extensível para
  WhatsApp Business API depois (OCP).
- **HTML de email gerado pelo sistema** a partir do conteúdo estruturado (sem HTML do usuário) —
  segurança (anti-XSS) e padronização. Reaproveita `gerarHtmlEmail` de `preview` (DRY).
- **Drivers de provedor** (de `email-config`) acessados por interface comum (DIP).
- **Orquestrador de canal** (`channel-dispatch`) decide WhatsApp/Email/ambos e registra
  `SendHistory` por destinatário; atualiza status da campanha para `sent`.
- **Idempotência/erros**: falhas por destinatário não abortam o lote; cada resultado é registrado.

## Risks / Trade-offs

- [`wa.me` exige ação do usuário/limite por destinatário] → tratar como geração de links/abertura; documentar limitação vs. API oficial.
- [Entregabilidade de email] → depende do provedor; registrar retorno e expor no histórico.
- [Divergência preview x envio] → usar exatamente as mesmas funções de geração.

## Migration Plan

1. Consolidar funções de geração (WhatsApp/Email) compartilhadas com `preview`.
2. Implementar service de email-send usando driver do provedor ativo.
3. Implementar geração de links `wa.me` e auto-formatação.
4. Implementar orquestrador de canal + registro em `SendHistory` + atualização de status.
Rollback: desabilitar disparo; campanhas permanecem como rascunho/agendadas.

## Open Questions

- Estratégia para grandes volumes de email (batches/limites do provedor) — definir na implementação.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`, `campaigns`, `email-config`, `contacts`, `file-storage`; compartilha geração com `preview`.
- É pré-requisito de: `scheduling`; alimenta `history-logs` e `dashboard`.
