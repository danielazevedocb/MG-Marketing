import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ListSkeletonProps = {
  rows?: number;
  showHeader?: boolean;
  className?: string;
};

export function ListSkeleton({
  rows = 5,
  showHeader = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Carregando">
      {showHeader ? (
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
      ) : null}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted/40 border-b px-4 py-3">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 w-24 md:block" />
              <Skeleton className="hidden h-4 w-20 lg:block" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
