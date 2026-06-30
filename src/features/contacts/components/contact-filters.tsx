"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ContactStatus } from "@/generated/prisma/enums";
import type { ContactListFiltersInput } from "@/schemas/contact";

type Option = { id: string; nome: string };

type ContactFiltersProps = {
  filters: ContactListFiltersInput;
  groups: Option[];
  tags: Option[];
  onChange: (next: Partial<ContactListFiltersInput>) => void;
};

export function ContactFilters({
  filters,
  groups,
  tags,
  onChange,
}: ContactFiltersProps) {
  return (
    <div className="grid w-full gap-3 sm:max-w-3xl sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Buscar por empresa, telefone ou e-mail"
          className="pl-9"
          aria-label="Buscar contatos"
        />
      </div>

      <Select
        value={filters.status ?? ""}
        onChange={(event) =>
          onChange({
            status: event.target.value
              ? (event.target.value as ContactStatus)
              : undefined,
          })
        }
        aria-label="Filtrar por status"
      >
        <option value="">Todos os status</option>
        <option value={ContactStatus.Ativo}>Ativo</option>
        <option value={ContactStatus.Inativo}>Inativo</option>
      </Select>

      <Select
        value={filters.groupId ?? ""}
        onChange={(event) =>
          onChange({ groupId: event.target.value || undefined })
        }
        aria-label="Filtrar por grupo"
      >
        <option value="">Todos os grupos</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.nome}
          </option>
        ))}
      </Select>

      <Select
        value={filters.tagId ?? ""}
        onChange={(event) => onChange({ tagId: event.target.value || undefined })}
        aria-label="Filtrar por tag"
        className="sm:col-span-2 lg:col-span-1"
      >
        <option value="">Todas as tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.nome}
          </option>
        ))}
      </Select>
    </div>
  );
}
