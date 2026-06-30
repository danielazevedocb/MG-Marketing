"use client";

import { useRouter } from "next/navigation";
import {
  History,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Plus,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { globalSearchAction } from "@/actions/search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import type { GlobalSearchGroup } from "@/services/search";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    keywords: "início painel",
  },
  {
    label: "Contatos",
    href: "/contacts",
    icon: Users,
    keywords: "clientes empresas",
  },
  {
    label: "Templates",
    href: "/templates",
    icon: LayoutTemplate,
    keywords: "modelos mensagens",
  },
  {
    label: "Campanhas",
    href: "/campaigns",
    icon: Megaphone,
    keywords: "envios marketing",
  },
  {
    label: "Histórico",
    href: "/history",
    icon: History,
    keywords: "envios auditoria",
  },
  {
    label: "Configurações de e-mail",
    href: "/settings/email",
    icon: Settings,
    keywords: "smtp provedor",
  },
] as const;

const quickActions = [
  {
    label: "Nova campanha",
    href: "/campaigns/new",
    icon: Plus,
    keywords: "criar campanha",
  },
  {
    label: "Novo template",
    href: "/templates/new",
    icon: Plus,
    keywords: "criar template",
  },
  {
    label: "Novo contato",
    href: "/contacts/new",
    icon: Plus,
    keywords: "criar contato",
  },
] as const;

type CommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GlobalSearchGroup[]>([]);
  const [isSearching, startSearch] = useTransition();
  const debouncedQuery = useDebounce(query, 300);

  const runSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setGroups([]);
      return;
    }

    startSearch(async () => {
      const result = await globalSearchAction({ query: trimmed, limit: 5 });
      if (result.success) {
        setGroups(result.data.groups);
      } else {
        setGroups([]);
      }
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setGroups([]);
      return;
    }
    runSearch(debouncedQuery);
  }, [debouncedQuery, open, runSearch]);

  function navigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar campanhas, templates, contatos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? "Buscando..." : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {groups.map((group) => (
          <CommandGroup key={group.type} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem
                key={`${item.type}-${item.id}`}
                value={`${item.title} ${item.subtitle ?? ""}`}
                onSelect={() => navigate(item.href)}
              >
                {item.favorite ? (
                  <Star className="fill-amber-400 text-amber-500" />
                ) : null}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{item.title}</span>
                  {item.subtitle ? (
                    <span className="text-muted-foreground truncate text-xs">
                      {item.subtitle}
                    </span>
                  ) : null}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {groups.length > 0 ? <CommandSeparator /> : null}

        <CommandGroup heading="Navegação">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.keywords}`}
                onSelect={() => navigate(item.href)}
              >
                <Icon />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Ações rápidas">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.keywords}`}
                onSelect={() => navigate(item.href)}
              >
                <Icon />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
      <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs">
        <span>Use as setas e Enter para navegar</span>
        <CommandShortcut>Ctrl K</CommandShortcut>
      </div>
    </CommandDialog>
  );
}
