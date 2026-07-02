"use client";

import { Copy, Megaphone, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

import {
  deleteCampaignAction,
  duplicateCampaignAction,
  type CampaignDto,
} from "@/actions/campaigns";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatScheduledAt,
  ScheduledCampaignControls,
} from "@/features/campaigns/components/scheduled-campaign-controls";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
} from "@/schemas/campaign";
import { CampaignStatus } from "@/generated/prisma/enums";

type CampaignListProps = {
  campaigns: CampaignDto[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error?: string;
  canWrite: boolean;
  canSend: boolean;
  onPageChange: (page: number) => void;
  onChanged: () => void;
};

export function CampaignList({
  campaigns,
  total,
  page,
  pageSize,
  isLoading,
  error,
  canWrite,
  canSend,
  onPageChange,
  onChanged,
}: CampaignListProps) {
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleDuplicate(id: string) {
    startTransition(async () => {
      const result = await duplicateCampaignAction(id);
      if (result.success) onChanged();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir esta campanha?")) return;
    startTransition(async () => {
      const result = await deleteCampaignAction(id);
      if (result.success) onChanged();
    });
  }

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
        {error}
      </div>
    );
  }

  if (isLoading && campaigns.length === 0) {
    return <ListSkeleton rows={4} />;
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Nenhuma campanha encontrada"
        description="Crie uma campanha para começar a enviar comunicações."
        action={
          canWrite ? (
            <Button asChild>
              <Link href="/campaigns/new">Criar campanha</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-border divide-y rounded-lg border">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/campaigns/${campaign.id}/edit`}
                  className="min-w-0 break-words font-medium hover:underline"
                >
                  {campaign.nome}
                </Link>
                <Badge variant="secondary">
                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </Badge>
                <Badge variant="outline">
                  {CAMPAIGN_TYPE_LABELS[campaign.type]}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {campaign.resolvedRecipientContactIds.length} destinatário(s)
                {campaign.channels.length > 0
                  ? ` · ${campaign.channels.join(", ")}`
                  : ""}
                {campaign.status === CampaignStatus.scheduled &&
                campaign.scheduledAt
                  ? ` · Agendada para ${formatScheduledAt(campaign.scheduledAt)}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {campaign.status === CampaignStatus.scheduled && canSend ? (
                <ScheduledCampaignControls
                  campaign={campaign}
                  disabled={isPending}
                  onChanged={onChanged}
                />
              ) : null}

              {canWrite ? (
                <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/campaigns/${campaign.id}/edit`}>
                    <Pencil className="size-4" />
                    Editar
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDuplicate(campaign.id)}
                >
                  <Copy className="size-4" />
                  Duplicar
                </Button>
                {campaign.status === CampaignStatus.draft ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(campaign.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
