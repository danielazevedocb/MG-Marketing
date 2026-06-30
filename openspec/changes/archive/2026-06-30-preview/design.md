## Context

Com o conteúdo da campanha disponível, o usuário precisa visualizar o resultado nos dois canais
antes de enviar. Esta change entrega o preview dual reativo, integrado à etapa de preview do
wizard de campanhas. A lógica de geração de WhatsApp/Email é compartilhada com `sending`.

## Goals / Non-Goals

**Goals:**
- Preview dual (WhatsApp à esquerda, Email à direita) em tempo real.
- Renderização fiel por canal a partir do conteúdo estruturado.

**Non-Goals:**
- Não envia mensagens (apenas visualiza).
- Não define a geração final definitiva (compartilhada/consolidada em `sending`).

## Decisions

- **Funções puras de formatação** (conteúdo → texto WhatsApp / HTML Email) reutilizáveis por
  `preview` e `sending` (DRY, SRP). Ficam em `src/lib`/`src/services`.
- **Reatividade no cliente**: preview deriva do estado do form (RHF) com debounce leve para
  performance; sem chamadas ao servidor a cada tecla.
- **Sanitização** do conteúdo ao montar o HTML do Email (evitar XSS), tratando entradas como dados.
- **Layout responsivo** lado a lado, colapsável em telas pequenas; respeita tema light/dark.

## Risks / Trade-offs

- [Divergência entre preview e envio real] → usar exatamente as mesmas funções de geração.
- [Performance ao digitar] → debounce e memoização do preview.
- [XSS no HTML do Email] → sanitização e ausência de HTML cru do usuário.

## Migration Plan

1. Extrair/definir funções de formatação WhatsApp e Email.
2. Implementar componentes de preview (WhatsApp/Email) e o container dual.
3. Integrar à etapa de preview do wizard de campanhas.
Rollback: componente isolado; remover não afeta criação/envio.

## Open Questions

- Quão fiel deve ser o "skin" do WhatsApp/Email (visual) — alinhar nível de fidelidade com o time.

## Dependências entre changes

- Depende de: `project-foundation`, `campaigns`; relacionado a `templates`.
- Compartilha geração com: `sending`; consumido pelo wizard de `campaigns`.
