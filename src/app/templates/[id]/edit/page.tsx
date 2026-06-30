import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { TemplateForm } from "@/features/templates/components/template-form";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";
import { getTemplateService } from "@/services/templates";

type EditTemplatePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTemplatePage({
  params,
}: EditTemplatePageProps) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "templates:write")) {
    redirect("/templates");
  }

  const { id } = await params;
  const template = await getTemplateService().getTemplateById(id);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/templates" className="hover:text-foreground">
            Templates
          </Link>{" "}
          / Editar
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Editar template
        </h1>
        <p className="text-muted-foreground mt-2">{template.nome}</p>
      </div>
      <TemplateForm mode="edit" initialData={template} />
    </div>
  );
}
