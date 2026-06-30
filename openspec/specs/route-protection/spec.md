# route-protection Specification

## Purpose
TBD - created by archiving change auth-rbac. Update Purpose after archive.
## Requirements
### Requirement: Proteção de rotas por middleware
O sistema SHALL usar middleware para proteger as rotas autenticadas do `app/`, redirecionando
usuários não autenticados para o login.

#### Scenario: Acesso não autenticado é bloqueado
- **WHEN** um usuário sem sessão acessa uma rota protegida
- **THEN** ele é redirecionado para a página de login

#### Scenario: Acesso autenticado é permitido
- **WHEN** um usuário com sessão válida acessa uma rota permitida ao seu perfil
- **THEN** a rota é renderizada normalmente

### Requirement: Guardas em Server Actions e Route Handlers
O sistema SHALL proteger Server Actions e Route Handlers com guardas de autenticação e papel,
assumindo sempre a possibilidade de 401/403.

#### Scenario: Route Handler exige autenticação
- **WHEN** um Route Handler protegido é chamado sem sessão
- **THEN** ele responde 401 sem executar a lógica

#### Scenario: Server Action exige papel adequado
- **WHEN** uma Server Action restrita é chamada por perfil sem permissão
- **THEN** ela retorna 403 e não executa a operação

