## 1. Base do domínio

- [x] 1.1 Definir schemas Zod de template (conteúdo estruturado + `TemplateType`)
- [x] 1.2 Implementar repository de templates (CRUD + consultas)
- [x] 1.3 Implementar service de templates (regras + auditoria)

## 2. CRUD e ações

- [x] 2.1 Implementar Server Actions de criar/editar/excluir com RBAC
- [x] 2.2 Implementar favoritar e duplicar (cópia profunda)
- [x] 2.3 Implementar busca e filtro por tipo/categoria
- [x] 2.4 Criar telas de lista e detalhe em `src/features/templates`

## 3. Editor e preview

- [x] 3.1 Implementar editor visual estruturado (sem HTML cru) com componentes shadcn/ui
- [x] 3.2 Integrar upload de imagens (file-storage) no editor
- [x] 3.3 Implementar pré-visualização que reflete o conteúdo em tempo real

## 4. Testes

- [x] 4.1 Teste: criar template com tipo válido persiste; tipo inválido é rejeitado
- [x] 4.2 Teste de RBAC: `Visualizador` não pode editar (403)
- [x] 4.3 Teste: duplicar gera novo registro sem alterar o original
- [x] 4.4 Teste: favoritar persiste o estado
- [x] 4.5 Teste: busca e filtro por tipo retornam o conjunto correto
- [x] 4.6 Teste: preview reflete alterações de campos do editor
