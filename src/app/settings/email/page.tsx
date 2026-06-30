import { EmailProvidersPageClient } from "@/features/settings/components/email-providers-page-client";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";

export default async function EmailSettingsPage() {
  const user = await getCurrentUser();
  const canWrite = user ? hasPermission(user.role, "emailConfig:write") : false;
  const canRead = user ? hasPermission(user.role, "emailConfig:read") : false;

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Provedores de email
        </h1>
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar esta configuração.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Provedores de email
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Cadastre provedores SMTP ou APIs transacionais, escolha qual está ativo
          e teste a conexão antes do envio de campanhas.
        </p>
      </div>
      <EmailProvidersPageClient canWrite={canWrite} />
    </div>
  );
}
