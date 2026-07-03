// Landing page pública da campanha — acessível sem sessão via slug não adivinhável.
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignLanding } from "@/features/campaigns/components/campaign-landing";
import { buildLandingViewModel } from "@/features/campaigns/lib/landing-model";
import { buildCampaignPublicUrl, getAppBaseUrl } from "@/lib/public-slug";
import { getCampaignService } from "@/services/campaigns";

type PublicCampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicCampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignService().getPublicCampaignBySlug(slug);

  if (!campaign) {
    return {
      title: "Campanha — MG Marketing",
      robots: { index: false, follow: false },
    };
  }

  const model = buildLandingViewModel(campaign.type, campaign.field);
  const title = model.titulo;
  const description =
    model.subtitulo ?? model.paragrafos[0]?.slice(0, 160) ?? undefined;

  return {
    metadataBase: new URL(getAppBaseUrl()),
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: buildCampaignPublicUrl(slug),
      siteName: "MG Marketing",
      type: "website",
      images: model.ogImageUrl ? [{ url: model.ogImageUrl }] : undefined,
    },
    twitter: {
      card: model.ogImageUrl ? "summary_large_image" : "summary",
      title,
      description,
    },
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
