"use client";

import { Search } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CommandMenu } from "@/components/layout/command-menu";
import { Button } from "@/components/ui/button";

type CommandMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

export function useCommandMenu() {
  const context = useContext(CommandMenuContext);
  if (!context) {
    throw new Error("useCommandMenu deve ser usado dentro de CommandMenuProvider.");
  }
  return context;
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
    }),
    [open, toggle],
  );

  return (
    <CommandMenuContext.Provider value={value}>
      {children}
      <CommandMenu open={open} onOpenChange={setOpen} />
    </CommandMenuContext.Provider>
  );
}

export function CommandMenuTrigger() {
  const { setOpen } = useCommandMenu();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-muted-foreground hidden h-8 gap-2 md:inline-flex"
      onClick={() => setOpen(true)}
    >
      <Search className="size-4" />
      <span>Buscar</span>
      <kbd className="bg-muted pointer-events-none hidden rounded border px-1.5 font-mono text-[10px] font-medium lg:inline-block">
        Ctrl K
      </kbd>
    </Button>
  );
}
