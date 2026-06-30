import Link from "next/link";
import { History, LayoutTemplate, Megaphone, Settings, Users } from "lucide-react";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold tracking-tight">
              MG Marketing
            </Link>
            <nav className="text-muted-foreground flex items-center gap-3 text-sm">
              <Link
                href="/contacts"
                className="hover:text-foreground flex items-center gap-1.5"
              >
                <Users className="size-4" />
                Contatos
              </Link>
              <Link
                href="/templates"
                className="hover:text-foreground flex items-center gap-1.5"
              >
                <LayoutTemplate className="size-4" />
                Templates
              </Link>
              <Link
                href="/campaigns"
                className="hover:text-foreground flex items-center gap-1.5"
              >
                <Megaphone className="size-4" />
                Campanhas
              </Link>
              <Link
                href="/history"
                className="text-foreground flex items-center gap-1.5 font-medium"
              >
                <History className="size-4" />
                Histórico
              </Link>
              <Link
                href="/settings/email"
                className="hover:text-foreground flex items-center gap-1.5"
              >
                <Settings className="size-4" />
                Configurações
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
