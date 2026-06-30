"use client";

import { useMemo } from "react";
import { Mail } from "lucide-react";

import {
  gerarHtmlEmail,
  type CampaignChannelContent,
  type EmailHtmlOptions,
} from "@/services/channel-content";

type EmailPreviewProps = {
  content: CampaignChannelContent;
  html?: string;
  options?: EmailHtmlOptions;
  className?: string;
};

export function EmailPreview({
  content,
  html,
  options,
  className,
}: EmailPreviewProps) {
  const emailHtml = useMemo(
    () => html ?? gerarHtmlEmail(content, options),
    [content, html, options],
  );

  return (
    <div
      className={`bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl border shadow-sm ${className ?? ""}`}
      data-testid="email-preview"
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="bg-muted flex size-8 items-center justify-center rounded-full">
          <Mail className="text-muted-foreground size-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium">Email</p>
          <p className="text-muted-foreground text-xs">
            HTML gerado automaticamente
          </p>
        </div>
      </div>

      <div className="bg-muted/40 min-h-[320px] flex-1 p-3">
        <iframe
          title="Pré-visualização do email"
          srcDoc={emailHtml}
          sandbox=""
          className="bg-background h-[420px] w-full rounded-md border"
          data-testid="email-preview-frame"
        />
      </div>
    </div>
  );
}
