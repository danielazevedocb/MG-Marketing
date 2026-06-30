## 1. Scaffold do projeto

- [x] 1.1 Inicializar app Next.js 15 (App Router) + React 19 + TypeScript (strict) com gerenciador de pacotes do projeto
- [x] 1.2 Configurar alias de import `@/*` para `src/` em `tsconfig.json`
- [x] 1.3 Criar a estrutura de pastas exata (`src/app`, `src/actions`, `src/components/{ui,layout,dashboard,marketing,forms}`, `src/features/{campaigns,templates,contacts,history,settings}`, `src/hooks`, `src/lib`, `prisma`, `src/repositories`, `src/schemas`, `src/services`, `src/styles`, `src/types`, `src/utils`) com `.gitkeep` onde vazio
- [x] 1.4 Criar `.env.example` com as variáveis previstas (sem segredos reais)

## 2. UI e tema

- [x] 2.1 Configurar Tailwind CSS v4 com tokens de tema em `src/styles`
- [x] 2.2 Inicializar shadcn/ui e adicionar componentes base (Button, Input, Dialog, Form)
- [x] 2.3 Integrar Magic UI, Framer Motion e Lucide React respeitando `prefers-reduced-motion`
- [x] 2.4 Configurar Next Themes (light/dark) com provider e toggle
- [x] 2.5 Configurar `QueryClientProvider` (TanStack Query) na raiz da aplicação
- [x] 2.6 Montar layout raiz (`src/app/layout.tsx`) com providers e página inicial mínima

## 3. Tooling de qualidade

- [x] 3.1 Configurar ESLint para TypeScript/React com script `lint`
- [x] 3.2 Configurar Prettier com script `format` e integração com ESLint
- [x] 3.3 Adicionar scripts npm (`dev`, `build`, `start`, `lint`, `format`, `test`)

## 4. Testes

- [x] 4.1 Instalar e configurar Vitest + Testing Library + ambiente jsdom
- [x] 4.2 Configurar resolução de alias `@/*` também no Vitest
- [x] 4.3 Escrever smoke test que valida o ambiente (asserção trivial passa)
- [x] 4.4 Escrever teste de renderização de um componente base (ex.: Button) com Testing Library
- [x] 4.5 Garantir que `lint`, `build` e `test` rodam sem erros em instalação limpa
