import { HistoryPageClient } from "@/features/history/components/history-page-client";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const canRead = user ? hasPermission(user.role, "history:read") : false;
  const canAudit = user ? hasPermission(user.role, "audit:read") : false;

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Histórico e auditoria
        </h1>
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar o histórico.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Histórico e auditoria
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Consulte envios realizados, filtre por campanha, canal e status, e
          exporte os resultados. Logs de auditoria ficam disponíveis para
          administradores.
        </p>
      </div>
      <HistoryPageClient canAudit={canAudit} />
    </div>
  );
}
