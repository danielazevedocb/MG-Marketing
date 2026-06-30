import { ContactsPageClient } from "@/features/contacts/components/contacts-page-client";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";

export default async function ContactsPage() {
  const user = await getCurrentUser();
  const canWrite = user ? hasPermission(user.role, "contacts:write") : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Contatos</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Cadastre, importe e organize destinatários por grupos e tags. A busca
          atualiza conforme você digita.
        </p>
      </div>
      <ContactsPageClient canWrite={canWrite} />
    </div>
  );
}
