"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { DualPreviewProps } from "@/components/marketing/dual-preview";

export const DualPreviewLazy = dynamic<DualPreviewProps>(
  () =>
    import("@/components/marketing/dual-preview").then((module) => ({
      default: module.DualPreview,
    })),
  {
    loading: () => <Skeleton className="h-96 w-full rounded-lg" />,
    ssr: false,
  },
);
