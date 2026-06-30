## 1. Configuração do Auth.js

- [x] 1.1 Instalar e configurar Auth.js com Prisma Adapter usando os modelos existentes
- [x] 1.2 Configurar provider de credenciais (e-mail/senha) com hash seguro de senha
- [x] 1.3 Configurar sessão em cookies HttpOnly/Secure e variáveis de ambiente (`AUTH_SECRET`)
- [x] 1.4 Criar páginas de login e logout em `src/app`

## 2. Helpers de autenticação e RBAC

- [x] 2.1 Implementar `getCurrentUser` (servidor) a partir da sessão
- [x] 2.2 Definir mapa de permissões por perfil (Administrador, Marketing, Comercial, Visualizador)
- [x] 2.3 Implementar `requireRole`/`requireAuth` reutilizáveis para actions e handlers

## 3. Proteção de rotas e ações

- [x] 3.1 Implementar `middleware.ts` protegendo rotas autenticadas com redirect ao login
- [x] 3.2 Aplicar guardas de autenticação/papel em Server Actions e Route Handlers
- [x] 3.3 Tratar respostas 401/403 com mensagens claras e UX de redirecionamento

## 4. Testes

- [x] 4.1 Teste: login com credenciais válidas cria sessão; inválidas são negadas
- [x] 4.2 Teste: `getCurrentUser` retorna usuário e papel a partir de sessão válida
- [x] 4.3 Teste de permissão: `Visualizador` é bloqueado (403) em ação de escrita
- [x] 4.4 Teste de permissão: `Administrador` é autorizado em ações suportadas
- [x] 4.5 Teste: rota protegida sem sessão redireciona para login
- [x] 4.6 Teste: Route Handler protegido responde 401 sem sessão
