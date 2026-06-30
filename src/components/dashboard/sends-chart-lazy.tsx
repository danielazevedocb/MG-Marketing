"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { SendTimeSeriesPoint } from "@/repositories/dashboard";

const SendsChart = dynamic(
  () =>
    import("@/components/dashboard/sends-chart").then((module) => ({
      default: module.SendsChart,
    })),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
    ssr: false,
  },
);

type SendsChartLazyProps = {
  data: SendTimeSeriesPoint[];
  className?: string;
};

export function SendsChartLazy(props: SendsChartLazyProps) {
  return <SendsChart {...props} />;
}
