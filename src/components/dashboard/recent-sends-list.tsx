import Link from "next/link";

import type { DashboardRecentSend } from "@/services/dashboard";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { CHANNEL_LABELS } from "@/schemas/campaign";
import { SEND_STATUS_LABELS } from "@/schemas/history";
import { cn } from "@/lib/utils";

type RecentSendsListProps = {
  items: DashboardRecentSend[];
  className?: string;
};

function formatSentAt(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusVariant(
  status: DashboardRecentSend["status"],
): "default" | "secondary" | "success" | "muted" {
  if (status === "Enviado") return "success";
  if (status === "Falha") return "muted";
  return "secondary";
}

export function RecentSendsList({ items, className }: RecentSendsListProps) {
  if (items.length === 0) {
    return (
      <DashboardEmptyState
        title="Nenhum envio registrado"
        description="Quando campanhas forem disparadas, os envios mais recentes aparecerão nesta lista."
      />
    );
  }

  return (
    <ul className={cn("divide-border divide-y rounded-lg border", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-medium">
              {item.campaignName ?? "Campanha sem nome"}
            </p>
            <p className="text-muted-foreground truncate text-sm">
              {item.recipient}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant="outline">
              {CHANNEL_LABELS[item.channel] ?? item.channel}
            </Badge>
            <Badge variant={statusVariant(item.status)}>
              {SEND_STATUS_LABELS[item.status] ?? item.status}
            </Badge>
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {formatSentAt(item.sentAt)}
            </span>
          </div>
        </li>
      ))}
      <li className="px-4 py-3">
        <Link
          href="/history"
          className="text-primary text-sm font-medium hover:underline"
        >
          Ver histórico completo
        </Link>
      </li>
    </ul>
  );
}
