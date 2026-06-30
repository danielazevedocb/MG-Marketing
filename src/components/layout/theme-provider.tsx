"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Provider de tema (Next Themes) com suporte a claro/escuro.
 * Usa a classe `.dark` no `<html>` para alternar os tokens definidos em `theme.css`.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
