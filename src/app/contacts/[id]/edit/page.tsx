import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ContactForm } from "@/features/contacts/components/contact-form";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";
import { getContactService } from "@/services/contacts";

type EditContactPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditContactPage({ params }: EditContactPageProps) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "contacts:write")) {
    redirect("/contacts");
  }

  const { id } = await params;
  const contact = await getContactService().getContactById(id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/contacts" className="hover:text-foreground">
            Contatos
          </Link>{" "}
          / Editar
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Editar contato
        </h1>
        <p className="text-muted-foreground mt-2">{contact.empresa}</p>
      </div>
      <ContactForm mode="edit" initialData={contact} />
    </div>
  );
}
