## Why

O objetivo final do sistema é enviar campanhas. É necessário implementar o envio por WhatsApp
(via link `wa.me`) e por Email (HTML moderno gerado automaticamente), com seleção de canal, sem
que o usuário precise editar HTML.

## What Changes

- Envio por WhatsApp via link gerado automaticamente: `https://wa.me/55NUMERO?text=MENSAGEM`, com auto-formatação (emojis, quebras de linha, links, destaques).
- Envio por Email com HTML moderno gerado automaticamente (banner, logo, título, texto, botão, rodapé) — usuário nunca edita HTML.
- Seleção de canal (WhatsApp / Email / ambos).
- Registro de cada envio no histórico (`SendHistory`).
- Uso do provedor de email ativo (de `email-config`).

## Capabilities

### New Capabilities
- `whatsapp-send`: geração do link `wa.me` por destinatário e auto-formatação da mensagem.
- `email-send`: geração de HTML moderno e disparo via provedor ativo.
- `channel-dispatch`: orquestração do envio por canal selecionado e registro no histórico.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria services de envio (WhatsApp/Email), orquestrador de canal e integração com `SendHistory`.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`, `campaigns`, `email-config`, `contacts`, `file-storage`, e compartilha geração com `preview`.
- É pré-requisito de `scheduling` (envio agendado) e alimenta `history-logs`/`dashboard`.
