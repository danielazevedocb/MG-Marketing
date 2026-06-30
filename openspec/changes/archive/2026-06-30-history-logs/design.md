## Context

Os modelos `SendHistory` e `AuditLog` já existem; o envio já registra histórico. Esta change
entrega a visualização/consulta com filtros e exportação, além de consolidar um helper de
auditoria reutilizado pelos módulos.

## Goals / Non-Goals

**Goals:**
- Consulta filtrável do histórico de envios + exportação.
- Helper de auditoria reutilizável e consulta de logs (restrita).

**Non-Goals:**
- Não reimplementa o registro de envio (feito em `sending`).
- Não cria dashboards/gráficos (fica em `dashboard`).

## Decisions

- **Helper de auditoria centralizado** (`auditLog(ator, acao, entidade, payload)`) chamado pelos
  services dos módulos — DRY e consistência; idealmente integrado às camadas de service.
- **Leitura paginada e filtrável** via repository de leitura; índices já previstos no schema.
- **Exportação CSV** gerada no servidor a partir do resultado filtrado (mesmos filtros da tela).
- **RBAC**: histórico amplo conforme perfil; auditoria restrita a Administrador.
- **Sem dados sensíveis** em claro nos logs (não logar credenciais/segredos).

## Risks / Trade-offs

- [Volume de logs/histórico] → paginação, índices e filtros server-side; arquivamento futuro.
- [Auditoria incompleta se módulos esquecerem de chamar o helper] → padronizar nos services e cobrir com testes.
- [Exportações grandes] → limitar/streaming na geração do CSV.

## Migration Plan

1. Helper de auditoria + integração nos services existentes.
2. Repositories de leitura (histórico/auditoria) com filtros + paginação.
3. Telas de histórico e auditoria em `src/features/history`.
4. Exportação CSV.
Rollback: feature de leitura isolada; registros continuam sendo gravados.

## Open Questions

- Quais perfis veem o histórico completo vs. parcial — confirmar política.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`, `sending`; auditoria alimentada por todos os módulos.
- Consumido por: `dashboard`.
