## 1. Integração com R2

- [x] 1.1 Configurar credenciais R2 em env de servidor e documentar no `.env.example`
- [x] 1.2 Implementar cliente S3-compatible para o R2 em `src/lib`
- [x] 1.3 Implementar serviço de storage (`upload`, `remove`) atrás de uma interface em `src/services`

## 2. Fluxo de upload

- [x] 2.1 Definir schema Zod de validação de arquivo (tipo, tamanho)
- [x] 2.2 Implementar Route Handler/Server Action de upload (com guarda de auth) usando URL pré-assinada ou upload server-side
- [x] 2.3 Implementar otimização/redimensionamento de imagens
- [x] 2.4 Implementar repository de `FileAsset` (criar/consultar/remover)
- [x] 2.5 Criar componente de Drag & Drop reutilizável em `src/components/forms`

## 3. Testes

- [x] 3.1 Teste do serviço de storage com R2 mockado: upload retorna URL pública
- [x] 3.2 Teste: remoção remove objeto e `FileAsset` de forma consistente
- [x] 3.3 Teste de validação: arquivo de tipo/tamanho inválido é rejeitado
- [x] 3.4 Teste: somente URL + metadados são persistidos (nunca o binário)
- [x] 3.5 Teste: credenciais do R2 não aparecem em bundle de cliente
