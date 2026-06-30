"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AuditLogFiltersInput } from "@/schemas/history";
import type { HistoryFilterOptions } from "@/actions/history";

const ENTITY_OPTIONS = [
  "Contact",
  "Group",
  "Tag",
  "Template",
  "Campaign",
  "EmailProvider",
];

type AuditLogFiltersProps = {
  filters: AuditLogFiltersInput;
  options?: HistoryFilterOptions;
  onChange: (next: Partial<AuditLogFiltersInput>) => void;
};

export function AuditLogFilters({
  filters,
  options,
  onChange,
}: AuditLogFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(event) => onChange({ dateFrom: event.target.value })}
        aria-label="Data inicial"
      />
      <Input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(event) => onChange({ dateTo: event.target.value })}
        aria-label="Data final"
      />

      <Select
        value={filters.actorId ?? ""}
        onChange={(event) =>
          onChange({ actorId: event.target.value || undefined })
        }
      >
        <option value="">Todos os atores</option>
        {options?.actors.map((actor) => (
          <option key={actor.id} value={actor.id}>
            {actor.name ?? actor.email}
          </option>
        ))}
      </Select>

      <Input
        placeholder="Filtrar por ação..."
        value={filters.action ?? ""}
        onChange={(event) => onChange({ action: event.target.value })}
      />

      <Select
        value={filters.entity ?? ""}
        onChange={(event) =>
          onChange({ entity: event.target.value || undefined })
        }
      >
        <option value="">Todas as entidades</option>
        {ENTITY_OPTIONS.map((entity) => (
          <option key={entity} value={entity}>
            {entity}
          </option>
        ))}
      </Select>

      <Input
        placeholder="ID da entidade"
        value={filters.entityId ?? ""}
        onChange={(event) => onChange({ entityId: event.target.value })}
      />
    </div>
  );
}
