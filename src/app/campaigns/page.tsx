import Link from "next/link";

import { CampaignsPageClient } from "@/features/campaigns/components/campaigns-page-client";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";

export default async function CampaignsPage() {
  const user = await getCurrentUser();
  const canWrite = user ? hasPermission(user.role, "campaigns:write") : false;
  const canSend = user ? hasPermission(user.role, "campaigns:send") : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
            Crie campanhas guiadas por etapas, salve rascunhos e prepare envios
            por WhatsApp e Email.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/campaigns/new">Nova campanha</Link>
          </Button>
        ) : null}
      </div>
      <CampaignsPageClient canWrite={canWrite} canSend={canSend} />
    </div>
  );
}
