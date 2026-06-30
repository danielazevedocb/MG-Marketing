## 1. Auditoria

- [x] 1.1 Implementar helper `auditLog` reutilizável (ator, ação, entidade, payload, timestamp)
- [x] 1.2 Integrar o helper nos services dos módulos (contatos, templates, campanhas, config, envio)

## 2. Consulta e exportação

- [x] 2.1 Implementar repository de leitura de `SendHistory` com filtros (período, canal, status, usuário, campanha) e paginação
- [x] 2.2 Implementar repository de leitura de `AuditLog` com filtros e paginação
- [x] 2.3 Criar telas de histórico e auditoria em `src/features/history` com filtros
- [x] 2.4 Implementar exportação CSV do resultado filtrado (servidor)
- [x] 2.5 Aplicar RBAC (auditoria restrita a Administrador)

## 3. Testes

- [x] 3.1 Teste: operação relevante gera `AuditLog` com ator/ação/entidade
- [x] 3.2 Teste: histórico exibe todas as colunas previstas
- [x] 3.3 Teste: filtros (período/canal/status) retornam o conjunto correto
- [x] 3.4 Teste: exportação CSV contém exatamente os registros filtrados
- [x] 3.5 Teste de RBAC: acesso à auditoria negado a perfis sem permissão (403)
