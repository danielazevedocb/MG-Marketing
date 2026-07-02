"use client";

import Link from "next/link";
import { Copy, LayoutTemplate, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  deleteTemplateAction,
  duplicateTemplateAction,
  toggleTemplateFavoriteAction,
  type TemplateDto,
} from "@/actions/templates";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/favorite-button";
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
import { TEMPLATE_TYPE_LABELS } from "@/schemas/template";

type TemplateListProps = {
  templates: TemplateDto[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error?: string;
  canWrite: boolean;
  onPageChange: (page: number) => void;
  onChanged: () => void;
};

export function TemplateList({
  templates,
  total,
  page,
  pageSize,
  isLoading,
  error,
  canWrite,
  onPageChange,
  onChanged,
}: TemplateListProps) {
  const [deleteTarget, setDeleteTarget] = useState<TemplateDto | null>(null);
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteTemplateAction(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
        onChanged();
      }
    });
  }

  function handleToggleFavorite(template: TemplateDto) {
    return toggleTemplateFavoriteAction(template.id).then((result) => ({
      success: result.success,
      error: result.success ? undefined : result.error,
    }));
  }

  function handleDuplicate(template: TemplateDto) {
    startTransition(async () => {
      const result = await duplicateTemplateAction(template.id);
      if (result.success) {
        toast.success("Template duplicado.");
        onChanged();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  if (isLoading && templates.length === 0) {
    return <ListSkeleton rows={5} />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? "Carregando templates..."
            : `${total} template(s) encontrado(s)`}
        </p>
        {canWrite ? (
          <Button asChild size="sm">
            <Link href="/templates/new">
              <Plus className="size-4" />
              Novo template
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-muted/40 border-b">
            <tr className="text-muted-foreground text-left">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Tipo
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Categoria
              </th>
              <th className="px-4 py-3 font-medium">Favorito</th>
              {canWrite ? (
                <th className="px-4 py-3 font-medium">Ações</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={canWrite ? 5 : 4}
                  className="text-muted-foreground px-4 py-10 text-center"
                >
                  Buscando templates...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 5 : 4} className="px-4 py-4">
                  <EmptyState
                    icon={LayoutTemplate}
                    title="Nenhum template nesta busca"
                    description="Ajuste os filtros ou crie um novo template."
                    action={
                      canWrite ? (
                        <Button asChild size="sm">
                          <Link href="/templates/new">
                            <Plus className="size-4" />
                            Novo template
                          </Link>
                        </Button>
                      ) : undefined
                    }
                    className="border-0 bg-transparent py-6"
                  />
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id} className="border-b last:border-b-0">
                  <td className="max-w-0 px-4 py-3">
                    <div className="min-w-0 font-medium break-words">
                      {template.nome}
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-xs md:hidden">
                      {TEMPLATE_TYPE_LABELS[template.type]}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Badge variant="secondary">
                      {TEMPLATE_TYPE_LABELS[template.type]}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {template.category || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {canWrite ? (
                      <FavoriteButton
                        active={template.favorite}
                        disabled={isPending}
                        label={template.nome}
                        onToggle={() => handleToggleFavorite(template)}
                        onChanged={onChanged}
                      />
                    ) : template.favorite ? (
                      <Star className="size-4 fill-amber-400 text-amber-500" />
                    ) : (
                      "—"
                    )}
                  </td>
                  {canWrite ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/templates/${template.id}/edit`}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => handleDuplicate(template)}
                        >
                          <Copy className="size-4" />
                          <span className="sr-only">Duplicar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(template)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Página {page} de {totalPages}
          </p>
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
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir template</DialogTitle>
            <DialogDescription className="wrap-anywhere">
              Tem certeza que deseja excluir{" "}
              <span className="text-foreground font-semibold wrap-anywhere">
                {deleteTarget?.nome}
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Excluindo..." : "Excluir template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
