import Link from "next/link";

import type { DashboardScheduledCampaign } from "@/services/dashboard";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { CHANNEL_LABELS } from "@/schemas/campaign";
import { cn } from "@/lib/utils";

type ScheduledCampaignsListProps = {
  items: DashboardScheduledCampaign[];
  className?: string;
};

function formatScheduledAt(iso: string | null): string {
  if (!iso) return "Sem data definida";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function channelLabel(campaign: DashboardScheduledCampaign): string {
  if (campaign.channels.length > 0) {
    return campaign.channels
      .map((channel) => CHANNEL_LABELS[channel] ?? channel)
      .join(" · ");
  }
  if (campaign.channel) {
    return CHANNEL_LABELS[campaign.channel] ?? campaign.channel;
  }
  return "Canal não definido";
}

export function ScheduledCampaignsList({
  items,
  className,
}: ScheduledCampaignsListProps) {
  if (items.length === 0) {
    return (
      <DashboardEmptyState
        title="Nenhuma campanha agendada"
        description="Campanhas com status agendado aparecerão aqui com a data prevista de envio."
      />
    );
  }

  return (
    <ul className={cn("divide-border divide-y rounded-lg border", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href={`/campaigns/${item.id}/edit`}
              className="truncate font-medium hover:underline"
            >
              {item.nome}
            </Link>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatScheduledAt(item.scheduledAt)}
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {channelLabel(item)}
          </Badge>
        </li>
      ))}
      <li className="px-4 py-3">
        <Link
          href="/campaigns"
          className="text-primary text-sm font-medium hover:underline"
        >
          Ver todas as campanhas
        </Link>
      </li>
    </ul>
  );
}
