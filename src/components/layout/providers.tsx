"use client";

import * as React from "react";

import { CommandMenuProvider } from "@/components/layout/command-menu-provider";
import { QueryProvider } from "@/components/layout/query-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Agrega os providers globais da aplicação (tema + cache de dados no cliente).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <CommandMenuProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </CommandMenuProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
