import type { DashboardActivityItem } from "@/services/dashboard";

import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

type ActivityTimelineProps = {
  items: DashboardActivityItem[];
  className?: string;
};

function formatActivityTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActor(item: DashboardActivityItem): string {
  return item.actorName ?? item.actorEmail ?? "Sistema";
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <DashboardEmptyState
        title="Nenhuma atividade recente"
        description="Ações como criação de campanhas e envios aparecerão aqui conforme o time usar o sistema."
      />
    );
  }

  return (
    <ol className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pl-1">
          {index < items.length - 1 ? (
            <span
              aria-hidden
              className="bg-border absolute top-6 left-[7px] h-[calc(100%+0.5rem)] w-px"
            />
          ) : null}
          <span
            aria-hidden
            className="bg-primary mt-1.5 size-2 shrink-0 rounded-full"
          />
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm leading-snug text-pretty">
              <span className="font-medium">{formatActor(item)}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-medium">{item.entity}</span>
              {item.entityId ? (
                <span className="text-muted-foreground"> · {item.entityId.slice(0, 8)}</span>
              ) : null}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {formatActivityTime(item.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
