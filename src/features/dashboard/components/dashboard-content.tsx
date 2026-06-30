import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { MagicCard } from "@/components/ui/magic-card";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { RecentSendsList } from "@/components/dashboard/recent-sends-list";
import { ScheduledCampaignsList } from "@/components/dashboard/scheduled-campaigns-list";
import { SendsChartLazy } from "@/components/dashboard/sends-chart-lazy";
import { BlurFade } from "@/components/ui/blur-fade";
import { getDashboardService } from "@/services/dashboard";

export async function DashboardContent() {
  const snapshot = await getDashboardService().getSnapshot();

  return (
    <div className="space-y-8">
      <BlurFade>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
              Visão geral de campanhas, envios e atividade recente. Use os
              atalhos abaixo para aprofundar em cada módulo.
            </p>
          </div>
          <Link
            href="/campaigns/new"
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Nova campanha
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </BlurFade>

      <section aria-labelledby="dashboard-metrics-heading">
        <h2 id="dashboard-metrics-heading" className="sr-only">
          Indicadores
        </h2>
        <MetricsGrid indicators={snapshot.indicators} />
      </section>

      <section
        aria-labelledby="dashboard-chart-heading"
        className="grid gap-6 lg:grid-cols-5"
      >
        <BlurFade className="lg:col-span-3" inView delay={0.05}>
          <MagicCard>
            <div className="p-5">
              <div className="mb-4">
                <h2
                  id="dashboard-chart-heading"
                  className="text-lg font-semibold tracking-tight"
                >
                  Envios nos últimos 14 dias
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Volume diário de mensagens registradas no histórico.
                </p>
              </div>
              <SendsChartLazy data={snapshot.timeSeries} />
            </div>
          </MagicCard>
        </BlurFade>

        <BlurFade className="lg:col-span-2" inView delay={0.08}>
          <MagicCard className="h-full">
            <div className="p-5">
              <h2 className="text-lg font-semibold tracking-tight">
                Atividade recente
              </h2>
              <p className="text-muted-foreground mt-1 mb-4 text-sm">
                Últimas ações registradas na auditoria do sistema.
              </p>
              <ActivityTimeline items={snapshot.activity} />
            </div>
          </MagicCard>
        </BlurFade>
      </section>

      <section
        aria-labelledby="dashboard-lists-heading"
        className="grid gap-6 lg:grid-cols-2"
      >
        <BlurFade inView delay={0.05}>
          <MagicCard>
            <div className="p-5">
              <h2
                id="dashboard-lists-heading"
                className="text-lg font-semibold tracking-tight"
              >
                Últimos envios
              </h2>
              <p className="text-muted-foreground mt-1 mb-4 text-sm">
                Disparos mais recentes com canal, status e destinatário.
              </p>
              <RecentSendsList items={snapshot.recentSends} />
            </div>
          </MagicCard>
        </BlurFade>

        <BlurFade inView delay={0.08}>
          <MagicCard>
            <div className="p-5">
              <h2 className="text-lg font-semibold tracking-tight">
                Campanhas agendadas
              </h2>
              <p className="text-muted-foreground mt-1 mb-4 text-sm">
                Próximos disparos programados pela equipe.
              </p>
              <ScheduledCampaignsList items={snapshot.scheduledCampaigns} />
            </div>
          </MagicCard>
        </BlurFade>
      </section>
    </div>
  );
}
