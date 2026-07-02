import Link from "next/link";
import {
  History,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";

import { CommandMenuTrigger } from "@/components/layout/command-menu-provider";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

type AppNavProps = {
  active?:
    | "dashboard"
    | "contacts"
    | "templates"
    | "campaigns"
    | "history"
    | "settings";
};

const navItems = [
  {
    id: "dashboard" as const,
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "contacts" as const,
    href: "/contacts",
    label: "Contatos",
    icon: Users,
  },
  {
    id: "templates" as const,
    href: "/templates",
    label: "Templates",
    icon: LayoutTemplate,
  },
  {
    id: "campaigns" as const,
    href: "/campaigns",
    label: "Campanhas",
    icon: Megaphone,
  },
  {
    id: "history" as const,
    href: "/history",
    label: "Histórico",
    icon: History,
  },
  {
    id: "settings" as const,
    href: "/settings",
    label: "Configurações",
    icon: Settings,
  },
];

export function AppNav({ active = "dashboard" }: AppNavProps) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            MG Marketing
          </Link>
          <nav className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5",
                    isActive
                      ? "text-foreground font-medium"
                      : "hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <CommandMenuTrigger />
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  active,
  children,
}: AppNavProps & { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppNav active={active} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
