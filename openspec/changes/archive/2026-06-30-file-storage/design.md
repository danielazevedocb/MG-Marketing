## Context

O modelo `FileAsset` já existe. Esta change implementa o armazenamento real dos binários no
Cloudflare R2 (compatível com API S3) e o fluxo de upload na UI. O banco guarda apenas URL +
metadados. Credenciais do R2 são segredos de servidor.

## Goals / Non-Goals

**Goals:**
- Serviço de servidor para upload/remoção no R2 com credenciais seguras.
- Upload por Drag & Drop com validação e otimização de imagens.
- Registro de `FileAsset` (URL pública + metadados).

**Non-Goals:**
- Não implementa galeria/gestão avançada de mídia (futuro).
- Não cobre uso específico em templates/campanhas (consumido por essas changes).

## Decisions

- **Cloudflare R2 via SDK S3-compatible** no servidor; alternativa (S3 puro) descartada por
  custo/saída. Upload preferencialmente por **URL pré-assinada** ou via Route Handler de
  servidor para não expor credenciais ao cliente.
- **Validação no servidor** (tipo, tamanho, dimensões) com Zod; o cliente apenas melhora UX.
- **Otimização de imagens** (ex.: sharp/Next Image) para reduzir peso; trade-off de CPU no
  upload aceito.
- **Componente de upload reutilizável** em `src/components/forms` (Drag & Drop) consumido por
  templates/campanhas — DRY.
- **Serviço isolado** (`src/services/storage`) atrás de uma interface, permitindo trocar o
  provedor no futuro (DIP/OCP).

## Risks / Trade-offs

- [Exposição de credenciais] → nunca em `NEXT_PUBLIC_*`; upload via servidor/URL pré-assinada.
- [Arquivos órfãos no R2 ao excluir registros] → rotina de remoção consistente e/ou limpeza.
- [Custo de otimização no request] → otimizar de forma assíncrona/limitada quando necessário.

## Migration Plan

1. Configurar credenciais R2 (env de servidor) e cliente S3-compatible.
2. Implementar serviço de upload/remoção + interface.
3. Schema Zod + Route Handler/Server Action de upload.
4. Componente Drag & Drop + otimização de imagem.
Rollback: desabilitar upload (feature isolada); `FileAsset` permanece consultável.

## Open Questions

- Política de retenção/limpeza de arquivos órfãos — definir na implementação.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`.
- É pré-requisito de: `templates`, `campaigns`, `sending`.
