## ADDED Requirements

### Requirement: Conexão Prisma com Supabase PostgreSQL
O sistema SHALL configurar o Prisma para conectar ao Supabase PostgreSQL usando variáveis de
ambiente do servidor (`DATABASE_URL` e, quando aplicável, `DIRECT_URL`), sem expor credenciais
ao cliente.

#### Scenario: Geração do client
- **WHEN** `prisma generate` é executado
- **THEN** o Prisma Client é gerado sem erros a partir do `schema.prisma`

#### Scenario: Segredos apenas no servidor
- **WHEN** o schema/config é inspecionado
- **THEN** a URL do banco vem de variáveis de servidor e nunca de variáveis `NEXT_PUBLIC_*`

### Requirement: Cliente Prisma singleton
O sistema SHALL expor um cliente Prisma único (singleton) em `src/lib` para evitar múltiplas
conexões em ambiente de desenvolvimento (hot reload).

#### Scenario: Reuso de instância
- **WHEN** o cliente Prisma é importado em múltiplos módulos durante o dev
- **THEN** a mesma instância é reutilizada, evitando esgotamento de conexões
