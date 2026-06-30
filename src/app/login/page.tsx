import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Rocket } from "lucide-react";

import { BlurFade } from "@/components/ui/blur-fade";
import { LoginForm } from "@/components/forms/login-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getCurrentUser } from "@/services/auth";

export const metadata: Metadata = {
  title: "Entrar — MG Marketing",
};

export default async function LoginPage() {
  // Se já houver sessão, não faz sentido exibir o login.
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <Rocket className="text-primary size-5" />
          MG Marketing
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <BlurFade className="w-full max-w-sm">
          <div className="border-border/60 bg-card rounded-xl border p-8 shadow-sm">
            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                Acessar a plataforma
              </h1>
              <p className="text-muted-foreground text-sm text-pretty">
                Entre com suas credenciais internas para gerenciar campanhas.
              </p>
            </div>
            <LoginForm />
          </div>
        </BlurFade>
      </main>
    </div>
  );
}
