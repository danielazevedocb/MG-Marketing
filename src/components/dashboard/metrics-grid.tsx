import {
  CalendarClock,
  Contact,
  FileText,
  Megaphone,
  Send,
  Sparkles,
  Timer,
} from "lucide-react";

import { BlurFade } from "@/components/ui/blur-fade";
import { MetricCard } from "@/components/dashboard/metric-card";
import type { DashboardIndicators } from "@/services/dashboard";

type MetricsGridProps = {
  indicators: DashboardIndicators;
};

const metrics = [
  {
    key: "campaignsTotal" as const,
    label: "Campanhas criadas",
    description: "Total de campanhas no sistema, em qualquer status.",
    icon: Megaphone,
  },
  {
    key: "campaignsSent" as const,
    label: "Campanhas enviadas",
    description: "Campanhas concluídas com disparo realizado.",
    icon: Send,
  },
  {
    key: "campaignsScheduled" as const,
    label: "Campanhas agendadas",
    description: "Disparos programados aguardando a data definida.",
    icon: CalendarClock,
  },
  {
    key: "campaignsDraft" as const,
    label: "Rascunhos",
    description: "Campanhas em elaboração ainda não enviadas.",
    icon: FileText,
  },
  {
    key: "templatesTotal" as const,
    label: "Templates cadastrados",
    description: "Modelos reutilizáveis disponíveis para campanhas.",
    icon: Sparkles,
  },
  {
    key: "contactsTotal" as const,
    label: "Contatos cadastrados",
    description: "Base de destinatários ativa no sistema.",
    icon: Contact,
  },
  {
    key: "sendsToday" as const,
    label: "Envios do dia",
    description: "Mensagens registradas desde a meia-noite de hoje.",
    icon: Timer,
  },
];

export function MetricsGrid({ indicators }: MetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <BlurFade key={metric.key} delay={index * 0.04} inView>
          <MetricCard
            label={metric.label}
            value={indicators[metric.key]}
            icon={metric.icon}
            description={metric.description}
            delay={index * 0.05}
          />
        </BlurFade>
      ))}
    </div>
  );
}
