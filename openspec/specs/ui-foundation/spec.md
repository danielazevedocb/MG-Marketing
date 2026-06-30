# ui-foundation Specification

## Purpose
TBD - created by archiving change project-foundation. Update Purpose after archive.
## Requirements
### Requirement: Tailwind CSS v4 com tema e dark mode
O sistema SHALL configurar Tailwind CSS v4 com tokens de tema (cores, radius, tipografia) e
suportar alternância entre temas claro e escuro via Next Themes.

#### Scenario: Alternância de tema
- **WHEN** o usuário alterna o tema para escuro
- **THEN** a interface aplica o tema escuro e a preferência é persistida entre sessões

### Requirement: Biblioteca de UI integrada
O sistema SHALL integrar shadcn/ui como base de interação, Magic UI como camada de efeitos,
Framer Motion para animações e Lucide React para ícones, sem duplicar APIs de componentes.

#### Scenario: Componente base renderiza
- **WHEN** um componente shadcn/ui (ex.: Button) é usado em uma página
- **THEN** ele renderiza com os tokens do tema aplicados

#### Scenario: Animações respeitam preferência de movimento
- **WHEN** o usuário tem `prefers-reduced-motion` ativo
- **THEN** efeitos do Magic UI / Framer Motion são reduzidos ou desativados

### Requirement: Provider de dados no cliente
O sistema SHALL prover um `QueryClientProvider` (TanStack Query) na raiz da aplicação para
gerenciar cache e estado de dados assíncronos no cliente.

#### Scenario: Provider disponível para componentes cliente
- **WHEN** um componente cliente usa um hook do TanStack Query
- **THEN** o hook acessa o `QueryClient` configurado sem erro de contexto

