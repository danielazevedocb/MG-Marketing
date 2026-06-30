import type { LucideIcon } from "lucide-react";

import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  delay?: number;
  className?: string;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  delay = 0,
  className,
}: MetricCardProps) {
  return (
    <MagicCard className={cn("h-full", className)}>
      <div className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              <NumberTicker value={value} delay={delay} />
            </p>
          </div>
          <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
        {description ? (
          <p className="text-muted-foreground text-sm text-pretty">{description}</p>
        ) : null}
      </div>
    </MagicCard>
  );
}
