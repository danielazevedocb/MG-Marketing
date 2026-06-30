"use client";

import { MessageCircle } from "lucide-react";

import { WhatsAppMessageBody } from "@/components/marketing/whatsapp-message-body";
import {
  buildWaMePreviewUrl,
  gerarMensagemWhatsApp,
  type CampaignChannelContent,
} from "@/services/channel-content";

type WhatsAppPreviewProps = {
  content: CampaignChannelContent;
  message?: string;
  className?: string;
};

export function WhatsAppPreview({
  content,
  message,
  className,
}: WhatsAppPreviewProps) {
  const formattedMessage = message ?? gerarMensagemWhatsApp(content);
  const waMeUrl = buildWaMePreviewUrl(formattedMessage);

  return (
    <div
      className={`bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm ${className ?? ""}`}
      data-testid="whatsapp-preview"
    >
      <div className="flex items-center gap-2 bg-[#075e54] px-4 py-3 text-white">
        <div className="flex size-8 items-center justify-center rounded-full bg-white/15">
          <MessageCircle className="size-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium">WhatsApp</p>
          <p className="text-xs text-white/80">Pré-visualização da mensagem</p>
        </div>
      </div>

      <div className="bg-[#e5ddd5] px-4 py-5 dark:bg-[#0b141a]">
        <div className="max-w-[92%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-sm leading-relaxed text-[#111b21] shadow-sm dark:bg-[#1f2c34] dark:text-[#e9edef]">
          {formattedMessage ? (
            <WhatsAppMessageBody message={formattedMessage} />
          ) : (
            <p className="text-muted-foreground">Preencha o conteúdo da campanha.</p>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-3">
        <p className="text-muted-foreground mb-1 text-xs">Link wa.me gerado</p>
        <a
          href={waMeUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary break-all text-xs underline-offset-2 hover:underline"
        >
          {waMeUrl}
        </a>
      </div>
    </div>
  );
}
