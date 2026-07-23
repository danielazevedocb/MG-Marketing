"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  listContactsAction,
  listGroupsAction,
  listTagsAction,
  type ContactListResponse,
} from "@/actions/contacts";
import { ContactFilters } from "@/features/contacts/components/contact-filters";
import { ContactImportDialog } from "@/features/contacts/components/contact-import-dialog";
import { ContactList } from "@/features/contacts/components/contact-list";
import { OrganizationPanel } from "@/features/contacts/components/organization-panel";
import { useDebounce } from "@/hooks/use-debounce";
import type { ContactListFiltersInput } from "@/schemas/contact";

type ContactsPageClientProps = {
  canWrite: boolean;
};

const defaultFilters: ContactListFiltersInput = {
  search: "",
  page: 1,
  pageSize: 20,
};

export function ContactsPageClient({ canWrite }: ContactsPageClientProps) {
  const [filters, setFilters] =
    useState<ContactListFiltersInput>(defaultFilters);
  const debouncedSearch = useDebounce(filters.search ?? "", 300);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch || undefined,
    }),
    [filters, debouncedSearch],
  );

  const contactsQuery = useQuery({
    queryKey: ["contacts", queryFilters],
    queryFn: async () => {
      const result = await listContactsAction(queryFilters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const groupsQuery = useQuery({
    queryKey: ["contact-groups"],
    queryFn: async () => {
      const result = await listGroupsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const tagsQuery = useQuery({
    queryKey: ["contact-tags"],
    queryFn: async () => {
      const result = await listTagsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  function handleFiltersChange(next: Partial<ContactListFiltersInput>) {
    setFilters((current) => ({
      ...current,
      ...next,
      page: next.page ?? 1,
    }));
  }

  function handleClearFilters() {
    setFilters(defaultFilters);
  }

  function handleImported() {
    void contactsQuery.refetch();
  }

  const data: ContactListResponse | undefined = contactsQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ContactFilters
          filters={filters}
          groups={groupsQuery.data ?? []}
          tags={tagsQuery.data ?? []}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
        />
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <ContactImportDialog onImported={handleImported} />
          </div>
        ) : null}
      </div>

      <ContactList
        contacts={data?.items ?? []}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 20}
        isLoading={contactsQuery.isLoading || contactsQuery.isFetching}
        error={contactsQuery.error?.message}
        canWrite={canWrite}
        onPageChange={(page) => handleFiltersChange({ page })}
        onDeleted={() => void contactsQuery.refetch()}
      />

      {canWrite ? (
        <OrganizationPanel
          groups={groupsQuery.data ?? []}
          tags={tagsQuery.data ?? []}
          onChanged={() => {
            void groupsQuery.refetch();
            void tagsQuery.refetch();
            void contactsQuery.refetch();
          }}
        />
      ) : null}
    </div>
  );
}
