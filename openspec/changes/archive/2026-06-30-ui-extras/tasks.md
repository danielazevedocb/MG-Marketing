## 1. Busca e Command Menu

- [x] 1.1 Implementar provider e componente de Command Menu (Ctrl+K) com navegação por teclado
- [x] 1.2 Implementar camada de busca global agregando módulos, filtrando por RBAC no servidor
- [x] 1.3 Integrar resultados de campanhas, templates e contatos na busca

## 2. Feedback e produtividade

- [x] 2.1 Implementar provider de toasts consistente
- [x] 2.2 Implementar hook de autosave (debounce) e aplicar ao wizard de campanhas
- [x] 2.3 Padronizar skeleton loading e empty states em `src/components`
- [x] 2.4 Implementar padrão de favoritos transversal (estado por usuário)

## 3. Performance e tema

- [x] 3.1 Aplicar dynamic imports em componentes pesados
- [x] 3.2 Aplicar streaming/Suspense e caching (RSC + TanStack Query)
- [x] 3.3 Polir consistência de tema light/dark (tokens, contraste, foco)

## 4. Testes

- [x] 4.1 Teste: Command Menu abre com Ctrl+K e navega por teclado
- [x] 4.2 Teste: busca global não retorna itens sem permissão (RBAC)
- [x] 4.3 Teste: autosave salva e permite retomar conteúdo (com debounce)
- [x] 4.4 Teste: skeleton e empty states renderizam nos estados corretos
- [x] 4.5 Teste: favoritar persiste e reflete nas listagens/busca
- [x] 4.6 Teste: animações respeitam `prefers-reduced-motion`
