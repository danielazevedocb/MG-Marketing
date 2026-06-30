import type { Metadata } from "next";
import Link from "next/link";
import { Rocket } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página não encontrada — MG Marketing",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <Rocket className="text-primary size-5" />
          MG Marketing
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground max-w-sm text-sm text-pretty">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Button asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </main>
    </div>
  );
}
