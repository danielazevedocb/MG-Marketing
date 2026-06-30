// Serviço de envio WhatsApp — gera links wa.me por destinatário.
import type { CampaignFieldInput } from "@/schemas/campaign";
import {
  gerarLinkWaMe,
  gerarMensagemWhatsApp,
  normalizarTelefoneWhatsApp,
} from "@/services/channel-content";

export type WhatsAppRecipient = {
  contactId: string;
  telefone: string | null;
  nome?: string | null;
};

export type WhatsAppSendResult =
  | {
      success: true;
      contactId: string;
      recipient: string;
      waMeUrl: string;
      message: string;
    }
  | {
      success: false;
      contactId: string;
      recipient: string;
      message: string;
    };

export function buildWhatsAppMessage(content: CampaignFieldInput): string {
  return gerarMensagemWhatsApp(content);
}

export function generateWaMeLinkForPhone(
  telefone: string,
  content: CampaignFieldInput,
): { success: true; waMeUrl: string; normalizedPhone: string; message: string } | { success: false; reason: string } {
  const normalized = normalizarTelefoneWhatsApp(telefone);
  if (!normalized.valid) {
    return { success: false, reason: normalized.reason };
  }

  const message = buildWhatsAppMessage(content);
  const waMeUrl = gerarLinkWaMe(normalized.normalized, message);

  return {
    success: true,
    waMeUrl,
    normalizedPhone: normalized.normalized,
    message,
  };
}

export function processWhatsAppRecipient(
  recipient: WhatsAppRecipient,
  content: CampaignFieldInput,
): WhatsAppSendResult {
  const displayRecipient = recipient.telefone?.trim() || recipient.contactId;
  const linkResult = generateWaMeLinkForPhone(
    recipient.telefone ?? "",
    content,
  );

  if (!linkResult.success) {
    return {
      success: false,
      contactId: recipient.contactId,
      recipient: displayRecipient,
      message: linkResult.reason,
    };
  }

  return {
    success: true,
    contactId: recipient.contactId,
    recipient: linkResult.normalizedPhone,
    waMeUrl: linkResult.waMeUrl,
    message: linkResult.waMeUrl,
  };
}
