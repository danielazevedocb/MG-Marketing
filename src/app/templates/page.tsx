import { TemplatesPageClient } from "@/features/templates/components/templates-page-client";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth";

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  const canWrite = user ? hasPermission(user.role, "templates:write") : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Crie e organize modelos reutilizáveis para campanhas. Favoritos,
          duplicação e busca ajudam a encontrar o conteúdo certo rapidamente.
        </p>
      </div>
      <TemplatesPageClient canWrite={canWrite} />
    </div>
  );
}
