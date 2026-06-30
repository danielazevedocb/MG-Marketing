"use client";

import { useMemo } from "react";

import { EmailPreview } from "@/components/marketing/email-preview";
import { WhatsAppPreview } from "@/components/marketing/whatsapp-preview";
import { useDebounce } from "@/hooks/use-debounce";
import {
  gerarHtmlEmail,
  gerarMensagemWhatsApp,
  type CampaignChannelContent,
} from "@/services/channel-content";

export type DualPreviewProps = {
  content: CampaignChannelContent;
  debounceMs?: number;
  className?: string;
};

export function DualPreview({
  content,
  debounceMs = 200,
  className,
}: DualPreviewProps) {
  const debouncedContent = useDebounce(content, debounceMs);

  const whatsappMessage = useMemo(
    () => gerarMensagemWhatsApp(debouncedContent),
    [debouncedContent],
  );

  const emailHtml = useMemo(
    () => gerarHtmlEmail(debouncedContent),
    [debouncedContent],
  );

  return (
    <div
      className={`grid gap-4 lg:grid-cols-2 ${className ?? ""}`}
      data-testid="dual-preview"
    >
      <WhatsAppPreview
        content={debouncedContent}
        message={whatsappMessage}
      />
      <EmailPreview content={debouncedContent} html={emailHtml} />
    </div>
  );
}
