"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SendHistoryDto } from "@/actions/history";
import { CHANNEL_LABELS } from "@/schemas/campaign";
import { SEND_STATUS_LABELS } from "@/schemas/history";
import { SendStatus } from "@/generated/prisma/enums";

type SendHistoryListProps = {
  items: SendHistoryDto[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error?: string;
  onPageChange: (page: number) => void;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

function statusVariant(status: SendHistoryDto["status"]) {
  if (status === SendStatus.Enviado) return "success" as const;
  if (status === SendStatus.Falha) return "muted" as const;
  return "secondary" as const;
}

export function SendHistoryList({
  items,
  total,
  page,
  pageSize,
  isLoading,
  error,
  onPageChange,
}: SendHistoryListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
        {error}
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Carregando histórico...</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum envio encontrado para os filtros selecionados.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Data/Hora</th>
              <th className="px-3 py-2 font-medium">Usuário</th>
              <th className="px-3 py-2 font-medium">Campanha</th>
              <th className="px-3 py-2 font-medium">Canal</th>
              <th className="px-3 py-2 font-medium">Destinatário</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Mensagem de retorno</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDateTime(item.sentAt)}
                </td>
                <td className="px-3 py-2">
                  {item.userName ?? item.userEmail ?? "—"}
                </td>
                <td className="px-3 py-2">{item.campaignName ?? "—"}</td>
                <td className="px-3 py-2">{CHANNEL_LABELS[item.channel]}</td>
                <td className="px-3 py-2">{item.recipient}</td>
                <td className="px-3 py-2">
                  <Badge variant={statusVariant(item.status)}>
                    {SEND_STATUS_LABELS[item.status]}
                  </Badge>
                </td>
                <td className="text-muted-foreground max-w-xs truncate px-3 py-2">
                  {item.returnMessage ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {total} registro{total === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-muted-foreground text-sm">
            Página {page} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
