import { cn } from "@/lib/utils";

type DashboardSkeletonProps = {
  className?: string;
};

function Block({ className }: { className?: string }) {
  return <div className={cn("bg-muted animate-pulse rounded-md", className)} />;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-8", className)} aria-busy="true" aria-label="Carregando dashboard">
      <div className="space-y-2">
        <Block className="h-8 w-48" />
        <Block className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Block key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Block className="h-72 lg:col-span-3" />
        <Block className="h-72 lg:col-span-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Block className="h-64" />
        <Block className="h-64" />
      </div>
    </div>
  );
}
