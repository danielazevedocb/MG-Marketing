## Why

Campanhas, templates e o sistema usam imagens e arquivos (banner, logo, imagens, catálogos,
PDFs). Esses binários não devem ficar no banco. É necessário integrar um storage de objetos
(Cloudflare R2) e guardar no banco apenas URLs públicas + metadados, com upload simples por
Drag & Drop e otimização de imagens.

## What Changes

- Integração com Cloudflare R2 (S3-compatible) via serviço dedicado no servidor.
- Upload de arquivos com Drag & Drop na UI.
- Persistir apenas a URL pública + metadados (`FileAsset`) no banco — nunca o binário.
- Otimização/validação de imagens (tipo, tamanho, dimensões) antes do upload.
- Geração de URLs e (quando aplicável) upload via URL pré-assinada para não expor credenciais.

## Capabilities

### New Capabilities
- `r2-integration`: serviço de servidor para enviar/remover objetos no Cloudflare R2 com credenciais seguras.
- `file-upload`: fluxo de upload (Drag & Drop) que valida, otimiza imagens e registra `FileAsset`.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- Cria serviço de storage em `src/services`, repository de `FileAsset`, schema Zod de upload e componente de upload em `src/components/forms`.
- Depende de `project-foundation`, `database-schema`, `auth-rbac`.
- É pré-requisito de `templates`, `campaigns`, `sending` (uso de imagens/arquivos).
