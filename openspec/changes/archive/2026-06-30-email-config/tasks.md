## 1. Criptografia

- [x] 1.1 Implementar serviço de criptografia (AES-256-GCM) com chave em env de servidor
- [x] 1.2 Documentar `ENCRYPTION_KEY` no `.env.example` e gestão da chave

## 2. Configuração de provedores

- [x] 2.1 Definir schemas Zod por tipo de provedor (SMTP com nome do remetente, email, host, porta, usuário, senha, SSL/TLS; demais por tipo)
- [x] 2.2 Implementar repository de `EmailProvider` (CRUD + ativo)
- [x] 2.3 Implementar service de provedores com criptografia das credenciais ao salvar
- [x] 2.4 Definir interface comum de provedor + drivers por tipo (SMTP/Resend/SendGrid/SES/Mailgun/Postmark)
- [x] 2.5 Implementar seleção de provedor ativo (garantir unicidade)
- [x] 2.6 Criar telas de configuração em `src/features/settings` (sem expor segredos)

## 3. Teste de conexão

- [x] 3.1 Implementar ação "Testar conexão" no servidor por tipo de provedor
- [x] 3.2 Exibir feedback de sucesso/falha sem vazar detalhes sensíveis

## 4. Testes

- [x] 4.1 Teste do serviço de criptografia: cifra/decifra corretamente; valor cifrado != claro
- [x] 4.2 Teste: cadastro SMTP válido persiste; campos obrigatórios ausentes são rejeitados
- [x] 4.3 Teste: credenciais nunca retornam em claro nas respostas da UI
- [x] 4.4 Teste: trocar provedor ativo mantém unicidade
- [x] 4.5 Teste: "Testar conexão" reporta sucesso/falha (com driver mockado)
- [x] 4.6 Teste de RBAC: perfis sem permissão não configuram provedores (403)
