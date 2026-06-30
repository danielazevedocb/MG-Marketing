"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TemplateType } from "@/generated/prisma/enums";
import {
  TEMPLATE_TYPE_LABELS,
  type TemplateListFiltersInput,
} from "@/schemas/template";

type TemplateFiltersProps = {
  filters: TemplateListFiltersInput;
  categories: string[];
  onChange: (next: Partial<TemplateListFiltersInput>) => void;
};

export function TemplateFilters({
  filters,
  categories,
  onChange,
}: TemplateFiltersProps) {
  return (
    <div className="grid w-full gap-3 sm:max-w-3xl sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Buscar por nome ou categoria"
          className="pl-9"
          aria-label="Buscar templates"
        />
      </div>

      <Select
        value={filters.type ?? ""}
        onChange={(event) =>
          onChange({
            type: event.target.value
              ? (event.target.value as TemplateType)
              : undefined,
          })
        }
        aria-label="Filtrar por tipo"
      >
        <option value="">Todos os tipos</option>
        {Object.values(TemplateType).map((type) => (
          <option key={type} value={type}>
            {TEMPLATE_TYPE_LABELS[type]}
          </option>
        ))}
      </Select>

      <Select
        value={filters.category ?? ""}
        onChange={(event) =>
          onChange({ category: event.target.value || undefined })
        }
        aria-label="Filtrar por categoria"
      >
        <option value="">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <label className="border-input flex items-center gap-2 rounded-md border px-3 py-2 text-sm sm:col-span-2 lg:col-span-1">
        <input
          type="checkbox"
          checked={Boolean(filters.favoritesOnly)}
          onChange={(event) =>
            onChange({ favoritesOnly: event.target.checked || undefined })
          }
        />
        Somente favoritos
      </label>
    </div>
  );
}
