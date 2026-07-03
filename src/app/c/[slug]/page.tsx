// Landing page pública da campanha — acessível sem sessão via slug não adivinhável.
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignLanding } from "@/features/campaigns/components/campaign-landing";
import { buildLandingViewModel } from "@/features/campaigns/lib/landing-model";
import { getCampaignService } from "@/services/campaigns";

type PublicCampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicCampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignService().getPublicCampaignBySlug(slug);

  return {
    title: campaign?.field.titulo ?? "Campanha — MG Marketing",
    robots: { index: false, follow: false },
  };
}

export default async function PublicCampaignPage({
  params,
}: PublicCampaignPageProps) {
  const { slug } = await params;
  const campaign = await getCampaignService().getPublicCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const model = buildLandingViewModel(campaign.type, campaign.field);

  return <CampaignLanding model={model} />;
}
