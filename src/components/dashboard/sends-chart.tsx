"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "next-themes";

import type { SendTimeSeriesPoint } from "@/repositories/dashboard";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

type SendsChartProps = {
  data: SendTimeSeriesPoint[];
  className?: string;
};

function formatChartDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function SendsChart({ data, className }: SendsChartProps) {
  const { resolvedTheme } = useTheme();
  const hasData = data.some((point) => point.count > 0);
  const stroke = resolvedTheme === "dark" ? "oklch(0.85 0 0)" : "oklch(0.35 0 0)";
  const grid = resolvedTheme === "dark" ? "oklch(0.35 0 0 / 0.35)" : "oklch(0.85 0 0)";
  const lineColor = "var(--color-chart-1)";

  if (!hasData) {
    return (
      <DashboardEmptyState
        title="Sem envios no período"
        description="O gráfico mostrará a evolução diária assim que houver envios registrados nos últimos 14 dias."
        className={className}
      />
    );
  }

  return (
    <div className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatChartDate}
            tick={{ fill: stroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: stroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            labelFormatter={(value) => formatChartDate(String(value))}
            formatter={(value) => [value, "Envios"]}
            contentStyle={{
              backgroundColor: "var(--color-popover)",
              borderColor: "var(--color-border)",
              borderRadius: "0.625rem",
              color: "var(--color-popover-foreground)",
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
