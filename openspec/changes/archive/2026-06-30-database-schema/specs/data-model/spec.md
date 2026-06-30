## ADDED Requirements

### Requirement: Entidades de autenticação e perfis
O sistema SHALL definir os modelos `User`, `Account`, `Session` e `VerificationToken`
compatíveis com o Prisma Adapter do Auth.js, e um enum `Role` com os valores `Administrador`,
`Marketing`, `Comercial`, `Visualizador`.

#### Scenario: Usuário possui papel
- **WHEN** um `User` é criado
- **THEN** ele possui um campo `role` do tipo `Role` com valor padrão definido

#### Scenario: Email único
- **WHEN** dois usuários tentam usar o mesmo email
- **THEN** a constraint `@unique` impede o segundo registro

### Requirement: Domínio de contatos com grupos e tags
O sistema SHALL definir `Contact` (com campos empresa, telefone, email, status), `Group` e
`Tag`, com relações N:N entre contatos e grupos, e entre contatos e tags.

#### Scenario: Contato associado a grupo e tag
- **WHEN** um contato é associado a um grupo e a uma tag
- **THEN** as relações N:N persistem e podem ser consultadas em ambos os sentidos

#### Scenario: Índice de busca por contato
- **WHEN** o schema é inspecionado
- **THEN** existem índices para os campos usados em busca/filtro (ex.: email, telefone, status)

### Requirement: Templates com tipo
O sistema SHALL definir `Template` com um enum `TemplateType` (`Novidade`, `Promocao`,
`Produto`, `Geral`) e metadados de favoritismo e autoria.

#### Scenario: Template com tipo válido
- **WHEN** um template é criado com `type = Promocao`
- **THEN** o registro é aceito pelo banco

### Requirement: Campanhas com campos, tipo e status
O sistema SHALL definir `Campaign` (com enum `CampaignType` e enum `CampaignStatus` =
`draft|scheduled|sent`) e `CampaignField` cobrindo titulo, subtitulo, texto, banner, imagem,
link, botao, preco, desconto, validade e observacoes.

#### Scenario: Campanha inicia como rascunho
- **WHEN** uma campanha é criada sem status explícito
- **THEN** seu `status` assume o valor padrão `draft`

#### Scenario: Campos da campanha relacionados
- **WHEN** uma campanha possui seus campos preenchidos
- **THEN** os `CampaignField` se relacionam à campanha por foreign key

### Requirement: Provedores de email com credenciais criptografadas
O sistema SHALL definir `EmailProvider` com enum `ProviderType`
(`SMTP|Resend|SendGrid|SES|Mailgun|Postmark`), flag `active` e armazenamento de credenciais de
forma criptografada (nunca em texto puro).

#### Scenario: Apenas um provedor ativo
- **WHEN** um provedor é marcado como `active`
- **THEN** o modelo permite identificar o provedor ativo de forma consistente

#### Scenario: Credenciais não ficam em texto puro
- **WHEN** as credenciais de um provedor são persistidas
- **THEN** o campo armazena valor criptografado, não as credenciais em claro

### Requirement: Histórico, auditoria e arquivos
O sistema SHALL definir `SendHistory` (envios), `AuditLog` (operações) e `FileAsset` (URL
pública + metadados de banner/logo/imagens/catálogos/PDFs).

#### Scenario: Registro de envio
- **WHEN** um envio é concluído
- **THEN** um `SendHistory` registra data/hora, canal, destinatário, status e mensagem de retorno

#### Scenario: FileAsset guarda apenas URL e metadados
- **WHEN** um arquivo é referenciado
- **THEN** o banco guarda a URL pública e metadados, não o binário do arquivo

### Requirement: Timestamps e integridade
O sistema SHALL incluir `createdAt` e `updatedAt` nos modelos persistentes e SHALL garantir
integridade relacional via foreign keys e constraints `@unique`/`@@unique` adequadas.

#### Scenario: Timestamps automáticos
- **WHEN** um registro é criado e depois atualizado
- **THEN** `createdAt` é preenchido na criação e `updatedAt` é atualizado a cada modificação
