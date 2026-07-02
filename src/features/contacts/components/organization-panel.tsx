"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createGroupAction,
  createTagAction,
  deleteGroupAction,
  deleteTagAction,
} from "@/actions/contacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GroupItem = {
  id: string;
  nome: string;
  _count: { contacts: number };
};

type TagItem = {
  id: string;
  nome: string;
  cor: string | null;
  _count: { contacts: number };
};

type OrganizationPanelProps = {
  groups: GroupItem[];
  tags: TagItem[];
  onChanged: () => void;
};

export function OrganizationPanel({
  groups,
  tags,
  onChanged,
}: OrganizationPanelProps) {
  const [groupName, setGroupName] = useState("");
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateGroup() {
    if (!groupName.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createGroupAction({ nome: groupName });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setGroupName("");
      onChanged();
    });
  }

  function handleCreateTag() {
    if (!tagName.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createTagAction({ nome: tagName });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTagName("");
      onChanged();
    });
  }

  function handleDeleteGroup(id: string, nome: string) {
    if (!confirm(`Remover o grupo "${nome}"? Esta ação não pode ser desfeita.`))
      return;
    startTransition(async () => {
      const result = await deleteGroupAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Grupo removido.");
      onChanged();
    });
  }

  function handleDeleteTag(id: string, nome: string) {
    if (!confirm(`Remover a tag "${nome}"? Esta ação não pode ser desfeita.`))
      return;
    startTransition(async () => {
      const result = await deleteTagAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Tag removida.");
      onChanged();
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="font-medium">Grupos</h2>
        <p className="text-muted-foreground text-sm">
          Organize contatos em grupos para segmentar campanhas.
        </p>
        <div className="flex gap-2">
          <Input
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Nome do grupo"
            disabled={isPending}
          />
          <Button onClick={handleCreateGroup} disabled={isPending}>
            Adicionar
          </Button>
        </div>
        <ul className="space-y-2">
          {groups.map((group) => (
            <li
              key={group.id}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">{group.nome}</span>
                <Badge variant="muted" className="ml-2">
                  {group._count.contacts}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => handleDeleteGroup(group.id, group.nome)}
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="font-medium">Tags</h2>
        <p className="text-muted-foreground text-sm">
          Marque contatos com tags para filtros rápidos.
        </p>
        <div className="flex gap-2">
          <Input
            value={tagName}
            onChange={(event) => setTagName(event.target.value)}
            placeholder="Nome da tag"
            disabled={isPending}
          />
          <Button onClick={handleCreateTag} disabled={isPending}>
            Adicionar
          </Button>
        </div>
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <div>
                <Badge variant="outline">{tag.nome}</Badge>
                <Badge variant="muted" className="ml-2">
                  {tag._count.contacts}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => handleDeleteTag(tag.id, tag.nome)}
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {error ? (
        <p className="text-destructive text-sm lg:col-span-2">{error}</p>
      ) : null}
    </section>
  );
}
