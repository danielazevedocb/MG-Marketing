## 1. Base do domínio

- [x] 1.1 Definir schemas Zod da campanha e de `CampaignField` (todos os campos)
- [x] 1.2 Implementar repository de campanhas (CRUD + status + consultas)
- [x] 1.3 Implementar service de campanhas (regras, transições de status, auditoria)

## 2. Wizard

- [x] 2.1 Implementar a máquina de etapas (criar → tipo → template → conteúdo → imagem → contatos → grupos → canal → preview → enviar/agendar)
- [x] 2.2 Validar cada etapa com Zod e bloquear avanço inválido
- [x] 2.3 Integrar seleção de template (snapshot do conteúdo)
- [x] 2.4 Integrar seleção de contatos/grupos como destinatários
- [x] 2.5 Integrar upload de banner/imagem (file-storage)
- [x] 2.6 Selecionar canal (WhatsApp/Email/ambos)

## 3. Rascunho e duplicação

- [x] 3.1 Implementar autosave de rascunho (status `draft`) e retomada
- [x] 3.2 Implementar duplicação de campanha (nova em `draft`)

## 4. Testes

- [x] 4.1 Teste: avanço de etapa válida preserva estado; etapa inválida bloqueia
- [x] 4.2 Teste: campos de conteúdo válidos persistem; numérico inválido é rejeitado
- [x] 4.3 Teste: seleção de grupo expande para contatos do grupo
- [x] 4.4 Teste: salvar rascunho e retomar restaura conteúdo e progresso
- [x] 4.5 Teste: duplicar cria nova campanha em `draft` sem alterar a original
- [x] 4.6 Teste de RBAC: perfis sem permissão não criam/editam campanhas (403)
