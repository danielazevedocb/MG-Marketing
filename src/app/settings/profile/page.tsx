import { ProfilePageClient } from "@/features/settings/components/profile-page-client";
import { getCurrentUser } from "@/services/auth";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Você precisa estar autenticado para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
          Gerencie seu nome de exibição e a senha de acesso.
        </p>
      </div>
      <ProfilePageClient name={user.name} email={user.email ?? ""} />
    </div>
  );
}
