## 1. Base do domínio

- [x] 1.1 Definir schemas Zod de contato (empresa, telefone, email, status)
- [x] 1.2 Implementar repository de contatos (CRUD + consultas com filtro)
- [x] 1.3 Implementar service de contatos com regras de negócio e auditoria

## 2. CRUD e UI

- [x] 2.1 Implementar Server Actions de criar/editar/excluir com guarda de RBAC
- [x] 2.2 Criar telas de lista e formulário em `src/features/contacts`
- [x] 2.3 Implementar busca instantânea (debounce + TanStack Query) e filtros (status, grupo, tag)

## 3. Organização e importação

- [x] 3.1 Implementar CRUD de grupos e tags e associação N:N a contatos
- [x] 3.2 Implementar importação CSV com validação por linha e resumo de resultado
- [x] 3.3 Definir interface `ContactImporter` e implementação placeholder `ErpMgImporter`

## 4. Testes

- [x] 4.1 Teste de service: criar contato válido persiste; inválido é rejeitado
- [x] 4.2 Teste de RBAC: `Visualizador` não pode criar/editar/excluir (403)
- [x] 4.3 Teste de importação CSV: linhas válidas importadas, inválidas reportadas
- [x] 4.4 Teste: associação a grupo e tag persiste e aparece em filtros
- [x] 4.5 Teste: busca e filtros combinados retornam o conjunto correto
- [x] 4.6 Teste: interface de importação do ERP MG (placeholder) não quebra o fluxo
