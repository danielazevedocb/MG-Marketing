import { CampaignWizard } from "@/features/campaigns/components/campaign-wizard";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";
import { redirect } from "next/navigation";

export default async function NewCampaignPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "campaigns:write")) {
    redirect("/campaigns");
  }

  const canSend = hasPermission(user.role, "campaigns:send");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Nova campanha</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Siga as etapas para montar sua campanha. O progresso é salvo
          automaticamente como rascunho.
        </p>
      </div>
      <CampaignWizard mode="create" canSend={canSend} />
    </div>
  );
}
