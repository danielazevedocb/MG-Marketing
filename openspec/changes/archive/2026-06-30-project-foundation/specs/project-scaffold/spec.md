## ADDED Requirements

### Requirement: Aplicação Next.js com App Router e TypeScript strict
O sistema SHALL prover uma aplicação Next.js 15 usando App Router, React 19 e TypeScript em
modo `strict`, sem uso de `any` implícito.

#### Scenario: Build de produção sem erros de tipo
- **WHEN** o comando de build é executado em uma instalação limpa
- **THEN** o projeto compila sem erros de TypeScript e gera o bundle de produção

#### Scenario: Página inicial responde
- **WHEN** o servidor de desenvolvimento é iniciado e a rota `/` é acessada
- **THEN** a aplicação renderiza a página inicial sem erros de runtime

### Requirement: Estrutura de pastas padronizada
O sistema SHALL adotar exatamente a arquitetura de pastas definida: `src/app`, `src/actions`,
`src/components/{ui,layout,dashboard,marketing,forms}`,
`src/features/{campaigns,templates,contacts,history,settings}`, `src/hooks`, `src/lib`,
`prisma`, `src/repositories`, `src/schemas`, `src/services`, `src/styles`, `src/types`,
`src/utils`.

#### Scenario: Todas as pastas existem
- **WHEN** a estrutura do repositório é inspecionada após o scaffold
- **THEN** todas as pastas listadas existem (com `.gitkeep` quando vazias)

### Requirement: Aliases de import e configuração de ambiente
O sistema SHALL configurar o alias de import `@/*` apontando para `src/` e fornecer um
`.env.example` documentando as variáveis necessárias.

#### Scenario: Import por alias funciona
- **WHEN** um módulo importa outro usando `@/lib/...`
- **THEN** a resolução do path funciona em build e em testes

#### Scenario: Exemplo de ambiente disponível
- **WHEN** um desenvolvedor clona o repositório
- **THEN** existe um `.env.example` listando as variáveis esperadas sem conter segredos reais
