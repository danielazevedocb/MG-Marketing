# authentication Specification

## Purpose
TBD - created by archiving change auth-rbac. Update Purpose after archive.
## Requirements
### Requirement: Login e sessão via Auth.js
O sistema SHALL autenticar usuários via Auth.js com Prisma Adapter, criando e mantendo sessão
em cookies seguros (HttpOnly).

#### Scenario: Login com credenciais válidas
- **WHEN** um usuário cadastrado faz login com credenciais válidas
- **THEN** uma sessão é criada e o usuário é redirecionado para a área autenticada

#### Scenario: Login com credenciais inválidas
- **WHEN** um usuário envia credenciais inválidas
- **THEN** o login é negado com mensagem clara e nenhuma sessão é criada

#### Scenario: Logout encerra a sessão
- **WHEN** o usuário faz logout
- **THEN** a sessão é invalidada e rotas protegidas deixam de ser acessíveis

### Requirement: Usuário atual no servidor
O sistema SHALL fornecer um helper de servidor para obter o usuário autenticado e seu papel a
partir da sessão.

#### Scenario: Recuperar usuário autenticado
- **WHEN** uma Server Action consulta o usuário atual com sessão válida
- **THEN** o helper retorna o usuário e seu `role`

