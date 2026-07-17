"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Copy,
  ExternalLink,
  Mail,
  Megaphone,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteCampaignAction,
  duplicateCampaignAction,
  resendCampaignAction,
  type CampaignDto,
} from "@/actions/campaigns";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduledCampaignControls } from "@/features/campaigns/components/scheduled-campaign-controls";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
} from "@/schemas/campaign";
import { Channel, CampaignStatus } from "@/generated/prisma/enums";

const STATUS_CLASSES: Record<CampaignStatus, string> = {
  [CampaignStatus.draft]: "bg-muted text-muted-foreground",
  [CampaignStatus.scheduled]:
    "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800",
  [CampaignStatus.sent]:
    "bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-800",
};

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  [Channel.Email]: <Mail className="size-3.5" />,
  [Channel.WhatsApp]: <MessageSquare className="size-3.5" />,
};

const CHANNEL_LABELS: Record<Channel, string> = {
  [Channel.Email]: "Email",
  [Channel.WhatsApp]: "WhatsApp",
};

function formatDate(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function recipientLabel(count: number): string {
  return count === 1 ? "1 destinatário" : `${count} destinatários`;
}

function CampaignMeta({ campaign }: { campaign: CampaignDto }) {
  const count = campaign.resolvedRecipientContactIds.length;

  const datePart =
    campaign.status === CampaignStatus.sent && campaign.sentAt
      ? `Enviada em ${formatDate(campaign.sentAt)}`
      : campaign.status === CampaignStatus.scheduled && campaign.scheduledAt
        ? `Agendada para ${formatDate(campaign.scheduledAt)}`
        : `Criada em ${formatDate(campaign.createdAt)}`;

  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span>{recipientLabel(count)}</span>

      {campaign.channels.length > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1.5">
            {campaign.channels.map((ch) => (
              <span key={ch} className="flex items-center gap-1">
                {CHANNEL_ICONS[ch as Channel]}
                {CHANNEL_LABELS[ch as Channel]}
              </span>
            ))}
          </span>
        </>
      )}

      <span aria-hidden>·</span>
      <span>{datePart}</span>
    </div>
  );
}

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
  const [resendTarget, setResendTarget] = useState<CampaignDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignDto | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleDuplicate(id: string, nome: string) {
    startTransition(async () => {
      const result = await duplicateCampaignAction(id);
      if (result.success) {
        toast.success(`"${nome}" duplicada com sucesso.`);
        onChanged();
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteCampaignAction(targetId);
      if (result.success) {
        toast.success("Campanha excluída.");
        onChanged();
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmResend() {
    if (!resendTarget) return;
    const targetId = resendTarget.id;
    setResendTarget(null);
    startTransition(async () => {
      const result = await resendCampaignAction(targetId);
      if (result.success) {
        const { summary } = result.data;
        if (summary.failure === summary.total) {
          toast.error(
            "Falha ao reenviar: nenhum envio foi concluído. Verifique o Histórico.",
          );
        } else if (summary.failure > 0) {
          toast.warning(
            `Campanha reenviada com ${summary.failure} falha(s). Verifique o Histórico.`,
          );
        } else {
          toast.success("Campanha reenviada com sucesso.");
        }
        onChanged();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
      >
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
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/campaigns/${campaign.id}/edit`}
                  className="min-w-0 font-medium wrap-break-word hover:underline"
                >
                  {campaign.nome}
                </Link>
                <Badge
                  variant="outline"
                  className={STATUS_CLASSES[campaign.status]}
                >
                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </Badge>
                <Badge variant="outline">
                  {CAMPAIGN_TYPE_LABELS[campaign.type]}
                </Badge>
              </div>
              <CampaignMeta campaign={campaign} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {campaign.status === CampaignStatus.scheduled && canSend ? (
                <ScheduledCampaignControls
                  campaign={campaign}
                  disabled={isPending}
                  onChanged={onChanged}
                />
              ) : null}

              {campaign.status === CampaignStatus.sent &&
              campaign.publicSlug ? (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/c/${campaign.publicSlug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Ver página
                  </a>
                </Button>
              ) : null}

              {canWrite || canSend ? (
                <div className="flex items-center gap-2">
                  {canWrite && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/campaigns/${campaign.id}/edit`}>
                        <Pencil className="size-4" />
                        Editar
                      </Link>
                    </Button>
                  )}
                  {canWrite && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() =>
                        handleDuplicate(campaign.id, campaign.nome)
                      }
                    >
                      <Copy className="size-4" />
                      Duplicar
                    </Button>
                  )}
                  {canSend && campaign.status === CampaignStatus.sent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => setResendTarget(campaign)}
                    >
                      <Send className="size-4" />
                      Reenviar
                    </Button>
                  ) : null}
                  {canWrite && campaign.status === CampaignStatus.draft ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => setDeleteTarget(campaign)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Excluir
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

      <Dialog
        open={Boolean(resendTarget)}
        onOpenChange={() => setResendTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reenviar campanha</DialogTitle>
            <DialogDescription className="wrap-anywhere">
              Reenviar{" "}
              <span className="text-foreground font-medium">
                &ldquo;{resendTarget?.nome}&rdquo;
              </span>{" "}
              para{" "}
              {resendTarget
                ? recipientLabel(
                    resendTarget.resolvedRecipientContactIds.length,
                  )
                : ""}
              ? Um novo envio será criado no histórico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResendTarget(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={confirmResend} disabled={isPending}>
              <Send className="size-4" />
              Reenviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir campanha</DialogTitle>
            <DialogDescription className="wrap-anywhere">
              Excluir{" "}
              <span className="text-foreground font-medium">
                &ldquo;{deleteTarget?.nome}&rdquo;
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
