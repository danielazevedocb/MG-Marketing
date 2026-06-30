"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteContactAction, type ContactDto } from "@/actions/contacts";
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
import { ContactStatus } from "@/generated/prisma/enums";

type ContactListProps = {
  contacts: ContactDto[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error?: string;
  canWrite: boolean;
  onPageChange: (page: number) => void;
};

export function ContactList({
  contacts,
  total,
  page,
  pageSize,
  isLoading,
  error,
  canWrite,
  onPageChange,
}: ContactListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ContactDto | null>(null);
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteContactAction(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
        onPageChange(page);
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

  if (isLoading && contacts.length === 0) {
    return <ListSkeleton rows={6} />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {isLoading ? "Carregando contatos..." : `${total} contato(s) encontrado(s)`}
        </p>
        {canWrite ? (
          <Button asChild size="sm">
            <Link href="/contacts/new">
              <Plus className="size-4" />
              Novo contato
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr className="text-muted-foreground text-left">
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Contato</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Telefone</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">E-mail</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell">Organização</th>
              {canWrite ? <th className="px-4 py-3 font-medium">Ações</th> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={canWrite ? 7 : 6}
                  className="text-muted-foreground px-4 py-10 text-center"
                >
                  Buscando contatos...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 7 : 6} className="px-4 py-4">
                  <EmptyState
                    icon={Users}
                    title="Nenhum contato nesta busca"
                    description="Ajuste os filtros ou cadastre um novo contato."
                    action={
                      canWrite ? (
                        <Button asChild size="sm">
                          <Link href="/contacts/new">
                            <Plus className="size-4" />
                            Novo contato
                          </Link>
                        </Button>
                      ) : undefined
                    }
                    className="border-0 bg-transparent py-6"
                  />
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{contact.empresa}</div>
                    <div className="text-muted-foreground mt-0.5 text-xs md:hidden">
                      {contact.telefone || contact.email || "—"}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {contact.nome || "—"}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {contact.telefone || "—"}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {contact.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        contact.status === ContactStatus.Ativo
                          ? "success"
                          : "muted"
                      }
                    >
                      {contact.status}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {contact.groups.map((group) => (
                        <Badge key={group.id} variant="secondary">
                          {group.nome}
                        </Badge>
                      ))}
                      {contact.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.nome}
                        </Badge>
                      ))}
                      {contact.groups.length === 0 && contact.tags.length === 0
                        ? "—"
                        : null}
                    </div>
                  </td>
                  {canWrite ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/contacts/${contact.id}/edit`}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(contact)}
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

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir contato</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deleteTarget?.empresa}</strong>? Esta ação não pode ser
              desfeita.
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
              {isPending ? "Excluindo..." : "Excluir contato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
