"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { CHANNEL_LABELS } from "@/schemas/campaign";
import {
  SEND_STATUS_LABELS,
  type SendHistoryFiltersInput,
} from "@/schemas/history";
import { Channel, SendStatus } from "@/generated/prisma/enums";
import type { HistoryFilterOptions } from "@/actions/history";

type SendHistoryFiltersProps = {
  filters: SendHistoryFiltersInput;
  options?: HistoryFilterOptions;
  onChange: (next: Partial<SendHistoryFiltersInput>) => void;
};

export function SendHistoryFilters({
  filters,
  options,
  onChange,
}: SendHistoryFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <DatePicker
        value={filters.dateFrom ?? ""}
        onChange={(dateFrom) => onChange({ dateFrom })}
        aria-label="Data inicial"
        placeholder="Data inicial"
      />
      <DatePicker
        value={filters.dateTo ?? ""}
        onChange={(dateTo) => onChange({ dateTo })}
        aria-label="Data final"
        placeholder="Data final"
      />

      <Select
        value={filters.campaignId ?? ""}
        onChange={(event) =>
          onChange({ campaignId: event.target.value || undefined })
        }
      >
        <option value="">Todas as campanhas</option>
        {options?.campaigns.map((campaign) => (
          <option key={campaign.id} value={campaign.id}>
            {campaign.nome}
          </option>
        ))}
      </Select>

      <Select
        value={filters.userId ?? ""}
        onChange={(event) =>
          onChange({ userId: event.target.value || undefined })
        }
      >
        <option value="">Todos os usuários</option>
        {options?.users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name ?? user.email}
          </option>
        ))}
      </Select>

      <Select
        value={filters.channel ?? ""}
        onChange={(event) =>
          onChange({
            channel: (event.target.value as Channel) || undefined,
          })
        }
      >
        <option value="">Todos os canais</option>
        {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.status ?? ""}
        onChange={(event) =>
          onChange({
            status: (event.target.value as SendStatus) || undefined,
          })
        }
      >
        <option value="">Todos os status</option>
        {Object.entries(SEND_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
