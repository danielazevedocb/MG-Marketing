"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEmailProvidersAction } from "@/actions/email-providers";
import { EmailProviderFormDialog } from "@/features/settings/components/email-provider-form-dialog";
import { EmailProviderList } from "@/features/settings/components/email-provider-list";
import { Button } from "@/components/ui/button";
import type { EmailProviderDto } from "@/services/email-providers";

type EmailProvidersPageClientProps = {
  canWrite: boolean;
};

export function EmailProvidersPageClient({
  canWrite,
}: EmailProvidersPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<EmailProviderDto | null>(
    null,
  );

  const providersQuery = useQuery({
    queryKey: ["email-providers"],
    queryFn: async () => {
      const result = await listEmailProvidersAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  function handleCreate() {
    setEditingProvider(null);
    setDialogOpen(true);
  }

  function handleEdit(provider: EmailProviderDto) {
    setEditingProvider(provider);
    setDialogOpen(true);
  }

  function handleSaved() {
    void providersQuery.refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {providersQuery.data?.length ?? 0} provedor(es) cadastrado(s)
        </p>
        {canWrite ? (
          <Button onClick={handleCreate}>Novo provedor</Button>
        ) : null}
      </div>

      <EmailProviderList
        canWrite={canWrite}
        providers={providersQuery.data ?? []}
        isLoading={providersQuery.isLoading}
        error={providersQuery.error?.message}
        onEdit={handleEdit}
        onChanged={handleSaved}
      />

      {canWrite ? (
        <EmailProviderFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingProvider}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
