import Link from "next/link";

import { ContactForm } from "@/features/contacts/components/contact-form";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";
import { redirect } from "next/navigation";

export default async function NewContactPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "contacts:write")) {
    redirect("/contacts");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/contacts" className="hover:text-foreground">
            Contatos
          </Link>{" "}
          / Novo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Novo contato
        </h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados do destinatário. Empresa é obrigatória.
        </p>
      </div>
      <ContactForm mode="create" />
    </div>
  );
}
