"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  listCampaignsAction,
  type CampaignListResponse,
} from "@/actions/campaigns";
import { CampaignFilters } from "@/features/campaigns/components/campaign-filters";
import { CampaignList } from "@/features/campaigns/components/campaign-list";
import { useDebounce } from "@/hooks/use-debounce";
import type { CampaignListFiltersInput } from "@/schemas/campaign";

type CampaignsPageClientProps = {
  canWrite: boolean;
  canSend: boolean;
};

const defaultFilters: CampaignListFiltersInput = {
  search: "",
  page: 1,
  pageSize: 20,
};

export function CampaignsPageClient({
  canWrite,
  canSend,
}: CampaignsPageClientProps) {
  const [filters, setFilters] =
    useState<CampaignListFiltersInput>(defaultFilters);
  const debouncedSearch = useDebounce(filters.search ?? "", 300);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch || undefined,
    }),
    [filters, debouncedSearch],
  );

  const campaignsQuery = useQuery({
    queryKey: ["campaigns", queryFilters],
    queryFn: async () => {
      const result = await listCampaignsAction(queryFilters);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  function handleFiltersChange(next: Partial<CampaignListFiltersInput>) {
    setFilters((current) => ({
      ...current,
      ...next,
      page: next.page ?? 1,
    }));
  }

  const data: CampaignListResponse | undefined = campaignsQuery.data;

  function handleClearFilters() {
    setFilters(defaultFilters);
  }

  return (
    <div className="space-y-6">
      <CampaignFilters
        filters={filters}
        onChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      <CampaignList
        campaigns={data?.items ?? []}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 20}
        isLoading={campaignsQuery.isLoading || campaignsQuery.isFetching}
        error={campaignsQuery.error?.message}
        canWrite={canWrite}
        canSend={canSend}
        onPageChange={(page) => handleFiltersChange({ page })}
        onChanged={() => {
          void campaignsQuery.refetch();
        }}
      />
    </div>
  );
}
