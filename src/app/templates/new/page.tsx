import Link from "next/link";
import { redirect } from "next/navigation";

import { TemplateForm } from "@/features/templates/components/template-form";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";

export default async function NewTemplatePage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "templates:write")) {
    redirect("/templates");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/templates" className="hover:text-foreground">
            Templates
          </Link>{" "}
          / Novo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Novo template
        </h1>
        <p className="text-muted-foreground mt-2">
          Monte o conteúdo com campos estruturados. A pré-visualização à direita
          reflete as alterações em tempo real.
        </p>
      </div>
      <TemplateForm mode="create" />
    </div>
  );
}
