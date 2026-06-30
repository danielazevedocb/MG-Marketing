# whatsapp-send Specification

## Purpose
TBD - created by archiving change sending. Update Purpose after archive.
## Requirements
### Requirement: Geração de link wa.me por destinatário
O sistema SHALL gerar, para cada destinatário, um link
`https://wa.me/55NUMERO?text=MENSAGEM` com o número normalizado (DDI 55) e a mensagem
URL-encoded.

#### Scenario: Link gerado corretamente
- **WHEN** um destinatário com telefone válido é processado
- **THEN** o sistema gera um link `wa.me` com o número normalizado e a mensagem codificada

#### Scenario: Telefone inválido é tratado
- **WHEN** um destinatário possui telefone inválido
- **THEN** o destinatário é sinalizado como inválido e registrado como falha no histórico

### Requirement: Auto-formatação da mensagem
O sistema SHALL formatar automaticamente a mensagem de WhatsApp (emojis, quebras de linha,
links e destaques) a partir do conteúdo estruturado da campanha.

#### Scenario: Formatação aplicada
- **WHEN** o conteúdo possui título, texto e link
- **THEN** a mensagem gerada contém os destaques e quebras adequados, pronta para envio

