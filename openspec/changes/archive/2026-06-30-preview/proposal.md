## Why

Para garantir qualidade e confiança antes do envio, o usuário precisa ver como a campanha
ficará nos dois canais. Um preview dual em tempo real (WhatsApp à esquerda, Email à direita)
que atualiza conforme o usuário digita reduz erros e acelera a aprovação.

## What Changes

- Painel de pré-visualização dual: WhatsApp (esquerda) e Email (direita).
- Atualização em tempo real conforme o conteúdo da campanha muda.
- Renderização fiel: WhatsApp como mensagem de texto formatada; Email como HTML moderno.

## Capabilities

### New Capabilities
- `dual-preview`: componente de preview lado a lado (WhatsApp + Email) reativo ao conteúdo.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria componentes de preview em `src/components` (reaproveitando geração de WhatsApp/Email do módulo de envio quando disponível).
- Depende de `project-foundation`, `campaigns` (conteúdo), e relacionado a `templates`.
- É consumido pelo wizard de `campaigns` (etapa preview) e por `sending`.
