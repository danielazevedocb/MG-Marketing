import { ChevronRight, Mail, MessageSquare, User } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

const settingsSections = [
  {
    href: "/settings/email",
    icon: Mail,
    title: "Provedores de Email",
    description:
      "Configure SMTP, SendGrid, SES e outros provedores para envio de campanhas.",
    available: true,
  },
  {
    href: "#",
    icon: MessageSquare,
    title: "WhatsApp",
    description:
      "Conecte uma conta WhatsApp Business para enviar campanhas pelo canal.",
    available: false,
  },
  {
    href: "#",
    icon: User,
    title: "Perfil",
    description: "Gerencie seus dados de acesso e preferências de conta.",
    available: false,
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie integrações, provedores e preferências do sistema.
        </p>
      </div>

      <div className="divide-border divide-y rounded-lg border">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          const content = (
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{section.title}</span>
                  {!section.available && (
                    <Badge variant="outline" className="text-xs">
                      Em breve
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {section.description}
                </p>
              </div>
              {section.available && (
                <ChevronRight className="text-muted-foreground size-4 shrink-0" />
              )}
            </div>
          );

          return section.available ? (
            <Link
              key={section.title}
              href={section.href}
              className="hover:bg-muted/50 block transition-colors"
            >
              {content}
            </Link>
          ) : (
            <div key={section.title} className="opacity-60">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
