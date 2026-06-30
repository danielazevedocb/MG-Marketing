# contact-crud Specification

## Purpose
TBD - created by archiving change contacts. Update Purpose after archive.
## Requirements
### Requirement: CRUD de contatos
O sistema SHALL permitir criar, listar, editar e excluir contatos com os campos empresa,
telefone, email e status, validando entradas com Zod no servidor e respeitando o RBAC.

#### Scenario: Criar contato válido
- **WHEN** um usuário com permissão cria um contato com dados válidos
- **THEN** o contato é persistido e aparece na listagem

#### Scenario: Dados inválidos são rejeitados
- **WHEN** um contato é enviado com email em formato inválido
- **THEN** a operação é rejeitada com mensagem clara e nada é persistido

#### Scenario: Visualizador não pode editar
- **WHEN** um usuário `Visualizador` tenta editar um contato
- **THEN** a ação é negada (403)

### Requirement: Edição e exclusão
O sistema SHALL permitir editar e excluir contatos existentes com confirmação e registro de auditoria.

#### Scenario: Editar contato
- **WHEN** um usuário com permissão edita um contato existente
- **THEN** as alterações são persistidas e refletidas na listagem

#### Scenario: Excluir contato
- **WHEN** um usuário com permissão exclui um contato
- **THEN** o contato é removido e deixa de aparecer na listagem

