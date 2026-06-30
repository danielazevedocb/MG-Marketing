import { notFound, redirect } from "next/navigation";

import { CampaignWizard } from "@/features/campaigns/components/campaign-wizard";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";
import { getCampaignService } from "@/services/campaigns";

type EditCampaignPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || !hasPermission(user.role, "campaigns:read")) {
    redirect("/login");
  }

  const campaign = await getCampaignService().getCampaignById(id);
  if (!campaign) {
    notFound();
  }

  const canWrite = hasPermission(user.role, "campaigns:write");
  const canSend = hasPermission(user.role, "campaigns:send");

  if (!canWrite && campaign.status !== "draft") {
    redirect("/campaigns");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {canWrite ? "Editar campanha" : "Visualizar campanha"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Retome o wizard a partir do último ponto salvo.
        </p>
      </div>
      <CampaignWizard
        mode="edit"
        initialCampaign={campaign}
        canSend={canSend}
      />
    </div>
  );
}
