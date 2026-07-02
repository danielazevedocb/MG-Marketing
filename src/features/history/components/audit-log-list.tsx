"use client";

import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/list-skeleton";
import type { AuditLogDto } from "@/actions/history";

type AuditLogListProps = {
  items: AuditLogDto[];
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

function formatPayload(payload: unknown): string {
  if (payload == null) return "—";
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

export function AuditLogList({
  items,
  total,
  page,
  pageSize,
  isLoading,
  error,
  onPageChange,
}: AuditLogListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
        {error}
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return <ListSkeleton rows={5} />;
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum log encontrado para os filtros selecionados.
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
              <th className="px-3 py-2 font-medium">Ator</th>
              <th className="px-3 py-2 font-medium">Ação</th>
              <th className="px-3 py-2 font-medium">Entidade</th>
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Payload</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDateTime(item.createdAt)}
                </td>
                <td className="px-3 py-2">
                  {item.actorName ?? item.actorEmail ?? "—"}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{item.action}</td>
                <td className="px-3 py-2">{item.entity}</td>
                <td className="text-muted-foreground px-3 py-2 font-mono text-xs">
                  {item.entityId ?? "—"}
                </td>
                <td className="text-muted-foreground max-w-sm truncate px-3 py-2 text-xs">
                  {formatPayload(item.payload)}
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
