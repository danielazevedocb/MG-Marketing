import { WhatsAppConfigPageClient } from "@/features/settings/components/whatsapp-config-page-client";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";

export default async function WhatsAppSettingsPage() {
  const user = await getCurrentUser();
  const canWrite = user
    ? hasPermission(user.role, "whatsappConfig:write")
    : false;
  const canRead = user
    ? hasPermission(user.role, "whatsappConfig:read")
    : false;

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">WhatsApp</h1>
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar esta configuração.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">WhatsApp</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Nome, telefone e assinatura usados no envio manual via wa.me. O envio
          continua sendo feito abrindo o link gerado por destinatário — não há
          integração com a API oficial do WhatsApp Business.
        </p>
      </div>
      <WhatsAppConfigPageClient canWrite={canWrite} />
    </div>
  );
}
