## 1. Geração de conteúdo por canal

- [x] 1.1 Implementar função pura `gerarMensagemWhatsApp(conteudo)` (texto formatado: emojis, quebras, destaques, links)
- [x] 1.2 Implementar função pura `gerarHtmlEmail(conteudo)` (banner, logo, título, texto, botão, rodapé) com sanitização
- [x] 1.3 Posicionar as funções em local compartilhável com `sending`

## 2. Componentes de preview

- [x] 2.1 Implementar componente de preview WhatsApp
- [x] 2.2 Implementar componente de preview Email
- [x] 2.3 Implementar container dual (esquerda/direita) responsivo e com tema light/dark
- [x] 2.4 Tornar o preview reativo ao conteúdo (debounce/memoização) e integrar ao wizard de campanhas

## 3. Testes

- [x] 3.1 Teste: `gerarMensagemWhatsApp` formata emojis/quebras/destaques/links corretamente
- [x] 3.2 Teste: `gerarHtmlEmail` produz HTML com seções esperadas e conteúdo sanitizado
- [x] 3.3 Teste: editar conteúdo atualiza ambos os previews
- [x] 3.4 Teste: layout dual renderiza ambos os painéis e respeita o tema
