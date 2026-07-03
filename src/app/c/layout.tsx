// Layout público das landing pages de campanha — sem chrome autenticado.
import type { ReactNode } from "react";

export default function PublicCampaignLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <main className="flex flex-1 items-center">{children}</main>
      <footer className="text-muted-foreground border-t py-4 text-center text-xs">
        MG Marketing
      </footer>
    </div>
  );
}
