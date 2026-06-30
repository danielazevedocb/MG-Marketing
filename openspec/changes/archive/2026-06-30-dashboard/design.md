## Context

Com os módulos de dados prontos, o dashboard consolida métricas e visões de leitura. É uma
camada de agregação/consumo: não altera dados de outros módulos. Apresentação moderna com
Magic UI, respeitando performance e acessibilidade.

## Goals / Non-Goals

**Goals:**
- Indicadores agregados + séries para gráficos.
- Layout com timeline, últimos envios, agendadas e gráficos.
- Animações performáticas e acessíveis.

**Non-Goals:**
- Não cria/edita dados de domínio (apenas leitura/agregação).
- Não substitui o histórico detalhado (`history-logs`).

## Decisions

- **Services de agregação dedicados** (`dashboard`) que consultam repositories existentes; evita
  espalhar regras de contagem pelas telas (SRP/DRY). Consultas otimizadas (count/groupBy).
- **RSC + cache** para a carga inicial; TanStack Query para atualizações no cliente.
- **Magic UI** (Magic Card, Number Ticker, Blur Fade, etc.) como camada de efeito sobre cards
  shadcn/ui, com `prefers-reduced-motion`. Biblioteca de gráficos leve (ex.: Recharts).
- **Estados vazios** explícitos e skeletons para preservar layout.

## Risks / Trade-offs

- [Consultas de agregação custosas] → usar count/groupBy e índices; cache de curta duração.
- [Excesso de animação] → respeitar reduced-motion e limitar efeitos a destaques.
- [Acoplamento ao formato dos módulos] → consumir via repositories/services, não SQL ad-hoc espalhado.

## Migration Plan

1. Services de agregação (indicadores + séries).
2. Componentes de dashboard (`src/components/dashboard`) + Magic UI.
3. Tela do dashboard com seções e estados vazios/skeleton.
Rollback: feature de leitura isolada.

## Open Questions

- Período padrão e granularidade dos gráficos — definir com o time.

## Dependências entre changes

- Depende de: `project-foundation`, `database-schema`, `auth-rbac`, `campaigns`, `templates`, `contacts`, `sending`, `scheduling`, `history-logs`.
- Não é pré-requisito de outras changes (camada de leitura).
