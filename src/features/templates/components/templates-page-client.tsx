"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  listTemplateCategoriesAction,
  listTemplatesAction,
  type TemplateListResponse,
} from "@/actions/templates";
import { TemplateFilters } from "@/features/templates/components/template-filters";
import { TemplateList } from "@/features/templates/components/template-list";
import { useDebounce } from "@/hooks/use-debounce";
import type { TemplateListFiltersInput } from "@/schemas/template";

type TemplatesPageClientProps = {
  canWrite: boolean;
};

const defaultFilters: TemplateListFiltersInput = {
  search: "",
  page: 1,
  pageSize: 20,
};

export function TemplatesPageClient({ canWrite }: TemplatesPageClientProps) {
  const [filters, setFilters] =
    useState<TemplateListFiltersInput>(defaultFilters);
  const debouncedSearch = useDebounce(filters.search ?? "", 300);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch || undefined,
    }),
    [filters, debouncedSearch],
  );

  const templatesQuery = useQuery({
    queryKey: ["templates", queryFilters],
    queryFn: async () => {
      const result = await listTemplatesAction(queryFilters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const categoriesQuery = useQuery({
    queryKey: ["template-categories"],
    queryFn: async () => {
      const result = await listTemplateCategoriesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  function handleFiltersChange(next: Partial<TemplateListFiltersInput>) {
    setFilters((current) => ({
      ...current,
      ...next,
      page: next.page ?? 1,
    }));
  }

  const data: TemplateListResponse | undefined = templatesQuery.data;

  return (
    <div className="space-y-6">
      <TemplateFilters
        filters={filters}
        categories={categoriesQuery.data ?? []}
        onChange={handleFiltersChange}
      />

      <TemplateList
        templates={data?.items ?? []}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 20}
        isLoading={templatesQuery.isLoading || templatesQuery.isFetching}
        error={templatesQuery.error?.message}
        canWrite={canWrite}
        onPageChange={(page) => handleFiltersChange({ page })}
        onChanged={() => {
          void templatesQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    </div>
  );
}
