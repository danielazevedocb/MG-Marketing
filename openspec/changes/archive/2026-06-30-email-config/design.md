## Context

O modelo `EmailProvider` (+ `ProviderType` e campo de credenciais) já existe. Esta change
implementa a configuração de provedores, seleção do ativo, teste de conexão e a criptografia
real das credenciais. É pré-requisito do envio de email.

## Goals / Non-Goals

**Goals:**
- CRUD de provedores por tipo, com campos específicos validados.
- Seleção de provedor ativo (único).
- Teste de conexão e criptografia de credenciais em repouso.

**Non-Goals:**
- Não envia campanhas (apenas configura e testa) — envio fica em `sending`.

## Decisions

- **Criptografia simétrica autenticada** (ex.: AES-256-GCM) com chave em env de servidor
  (`ENCRYPTION_KEY`); credenciais decriptadas apenas no momento do uso. Alternativa (texto puro)
  rejeitada por segurança/regra do projeto.
- **Serviço de criptografia isolado** (`src/services`/`src/lib`) reutilizável e testável (SRP).
- **Abstração de provedor** (`EmailProvider` driver por tipo) atrás de uma interface comum —
  OCP/DIP; `sending` consome a interface sem conhecer o tipo concreto.
- **Teste de conexão no servidor**, sem enviar campanha; feedback claro sem vazar detalhes.
- **RBAC**: apenas Administrador (e talvez Marketing) configuram provedores; respostas nunca
  retornam segredos em claro.

## Risks / Trade-offs

- [Vazamento de credenciais em logs/respostas] → nunca logar segredos; mascarar em respostas.
- [Perda da chave de criptografia] → documentar gestão da chave; rotação planejada.
- [Diferenças entre provedores] → interface comum + drivers por tipo isolam variações.

## Migration Plan

1. Serviço de criptografia + chave em env.
2. Schemas Zod por tipo de provedor + repository + service.
3. CRUD + seleção de ativo em `src/features/settings`.
4. Teste de conexão por tipo de provedor.
Rollback: feature isolada; sem provedor configurado, o envio de email fica indisponível (esperado).

## Open Questions

- Quais perfis além de Administrador podem configurar provedores — confirmar política.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`.
- É pré-requisito de: `sending` (canal Email).
