"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  type CampaignListFiltersInput,
} from "@/schemas/campaign";
import { CampaignStatus, CampaignType } from "@/generated/prisma/enums";

type CampaignFiltersProps = {
  filters: CampaignListFiltersInput;
  onChange: (next: Partial<CampaignListFiltersInput>) => void;
  onClear: () => void;
};

export function CampaignFilters({
  filters,
  onChange,
  onClear,
}: CampaignFiltersProps) {
  const hasFilters = Boolean(filters.search || filters.status || filters.type);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        placeholder="Buscar campanhas..."
        value={filters.search ?? ""}
        onChange={(event) => onChange({ search: event.target.value })}
        className="sm:max-w-xs"
      />

      <Select
        value={filters.status ?? ""}
        onChange={(event) =>
          onChange({
            status: (event.target.value as CampaignStatus) || undefined,
          })
        }
        className="sm:w-40"
      >
        <option value="">Todos os status</option>
        {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.type ?? ""}
        onChange={(event) =>
          onChange({
            type: (event.target.value as CampaignType) || undefined,
          })
        }
        className="sm:w-40"
      >
        <option value="">Todos os tipos</option>
        {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar
        </Button>
      ) : null}
    </div>
  );
}
