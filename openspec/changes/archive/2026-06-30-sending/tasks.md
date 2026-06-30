## 1. Geração de conteúdo

- [x] 1.1 Consolidar `gerarMensagemWhatsApp` e `gerarHtmlEmail` compartilhadas com `preview`
- [x] 1.2 Implementar normalização de telefone (DDI 55) e geração do link `wa.me` (mensagem URL-encoded)

## 2. Envio por canal

- [x] 2.1 Implementar service de envio de email usando o driver do provedor ativo (credenciais decriptadas no servidor)
- [x] 2.2 Implementar geração de links `wa.me` por destinatário
- [x] 2.3 Implementar orquestrador `channel-dispatch` (WhatsApp/Email/ambos)
- [x] 2.4 Registrar cada envio em `SendHistory` (data, hora, usuário, campanha, canal, destinatário, status, retorno)
- [x] 2.5 Atualizar status da campanha para `sent` ao concluir
- [x] 2.6 Bloquear envio de email quando não há provedor ativo (mensagem clara)

## 3. Testes

- [x] 3.1 Teste: link `wa.me` é gerado com número normalizado e mensagem codificada
- [x] 3.2 Teste: telefone inválido é sinalizado e registrado como falha
- [x] 3.3 Teste: `gerarHtmlEmail` produz HTML sanitizado com as seções esperadas
- [x] 3.4 Teste: envio de email usa provedor ativo (driver mockado) e registra resultado
- [x] 3.5 Teste: sem provedor ativo, envio de email é bloqueado
- [x] 3.6 Teste: canal "ambos" processa WhatsApp e Email; falha de um destinatário não aborta o lote
- [x] 3.7 Teste: status da campanha vira `sent` ao concluir o envio
