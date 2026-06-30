import { EmptyState } from "@/components/empty-state";

type DashboardEmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function DashboardEmptyState(props: DashboardEmptyStateProps) {
  return <EmptyState {...props} />;
}
