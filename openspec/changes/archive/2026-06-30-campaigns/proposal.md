## Why

A campanha é o objeto central do MG Marketing. É necessário um fluxo guiado (wizard) que
conduza o usuário da criação ao envio/agendamento, com todos os campos de conteúdo, rascunhos e
duplicação — permitindo criar campanhas em minutos e de forma padronizada.

## What Changes

- Wizard de criação: criar → tipo → template → editar conteúdo → imagem → contatos → grupos → canal → preview → enviar/agendar.
- Todos os campos da campanha (titulo, subtitulo, texto, banner, imagem, link, botao, preco, desconto, validade, observacoes).
- Salvar rascunho (status `draft`) a qualquer momento.
- Duplicar campanha existente.
- Seleção de destinatários (contatos/grupos) e canal.

## Capabilities

### New Capabilities
- `campaign-wizard`: fluxo guiado em etapas para montar a campanha.
- `campaign-content`: gestão dos campos de conteúdo da campanha e mídia.
- `campaign-drafts`: salvar rascunho e duplicar campanhas.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria feature `src/features/campaigns`, actions, services, repositories, schemas e componentes do wizard.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`, `file-storage`, `contacts`, `templates`.
- É pré-requisito de `preview`, `sending`, `scheduling`; consumido por `dashboard` e `history-logs`.
