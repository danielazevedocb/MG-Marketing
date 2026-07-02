// Orquestrador de envio por canal — WhatsApp, Email ou ambos.
import { Channel, SendStatus } from "@/generated/prisma/enums";
import { CampaignValidationError } from "@/lib/campaign-errors";
import { NoActiveEmailProviderError } from "@/lib/sending-errors";
import { auditLog } from "@/services/audit-log";
import {
  claimDraftCampaignForDispatch,
  findCampaignById,
} from "@/repositories/campaign";
import { findContactsByIds } from "@/repositories/contact";
import { createSendHistory } from "@/repositories/send-history";
import type { CampaignFieldInput } from "@/schemas/campaign";
import {
  assertCampaignContentComplete,
  fieldToInput,
} from "@/services/campaigns";
import {
  getActiveEmailProviderContext,
  sendCampaignEmail,
} from "@/services/email-send";
import {
  processWhatsAppRecipient,
  type WhatsAppRecipient,
} from "@/services/whatsapp-send";

export type DispatchResultItem = {
  channel: Channel;
  recipient: string;
  contactId: string;
  status: SendStatus;
  returnMessage: string | null;
};

export type DispatchCampaignResult = {
  campaignId: string;
  items: DispatchResultItem[];
  summary: {
    total: number;
    success: number;
    failure: number;
  };
};

type DispatchRecipient = {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
};

const NO_EMAIL_PROVIDER_MESSAGE =
  "Nenhum provedor de email ativo. Configure um provedor em Configurações > Email antes de enviar.";

async function resolveRecipients(
  contactIds: string[],
  groupIds: string[],
): Promise<DispatchRecipient[]> {
  const { resolveRecipientContactIds } = await import("@/services/campaigns");
  const resolvedIds = await resolveRecipientContactIds(contactIds, groupIds);
  const contacts = await findContactsByIds(resolvedIds);

  return contacts.map((contact) => ({
    id: contact.id,
    nome: contact.nome,
    email: contact.email,
    telefone: contact.telefone,
  }));
}

function buildEmailSubject(content: CampaignFieldInput): string {
  return content.titulo?.trim() || "Campanha MG Marketing";
}

async function recordHistory(
  params: {
    campaignId: string;
    userId: string;
    channel: Channel;
    recipient: string;
    status: SendStatus;
    returnMessage: string | null;
  },
  historyWriter: typeof createSendHistory = createSendHistory,
): Promise<void> {
  await historyWriter({
    campaignId: params.campaignId,
    userId: params.userId,
    channel: params.channel,
    recipient: params.recipient,
    status: params.status,
    returnMessage: params.returnMessage,
    sentAt: new Date(),
  });
}

export class ChannelDispatchService {
  constructor(
    private readonly deps: {
      getActiveProvider?: typeof getActiveEmailProviderContext;
      sendEmail?: typeof sendCampaignEmail;
      recordHistory?: typeof createSendHistory;
    } = {},
  ) {}

  async dispatchCampaign(
    campaignId: string,
    actorId: string,
  ): Promise<DispatchCampaignResult> {
    const campaign = await findCampaignById(campaignId);
    if (!campaign) {
      throw new CampaignValidationError("Campanha não encontrada");
    }

    const channels = campaign.channels;
    if (channels.length === 0) {
      throw new CampaignValidationError("Selecione ao menos um canal de envio");
    }

    const recipients = await resolveRecipients(
      campaign.recipientContactIds,
      campaign.recipientGroupIds,
    );

    if (recipients.length === 0) {
      throw new CampaignValidationError("Selecione ao menos um destinatário");
    }

    const content = fieldToInput(
      campaign.field
        ? {
            titulo: campaign.field.titulo,
            subtitulo: campaign.field.subtitulo,
            texto: campaign.field.texto,
            banner: campaign.field.banner,
            imagem: campaign.field.imagem,
            link: campaign.field.link,
            botao: campaign.field.botao,
            preco: campaign.field.preco,
            desconto: campaign.field.desconto,
            validade: campaign.field.validade?.toISOString() ?? null,
            observacoes: campaign.field.observacoes,
          }
        : null,
    );

    assertCampaignContentComplete(content);

    const getActiveProvider =
      this.deps.getActiveProvider ?? getActiveEmailProviderContext;
    const sendEmail = this.deps.sendEmail ?? sendCampaignEmail;
    const historyWriter = this.deps.recordHistory ?? createSendHistory;

    const includesEmail = channels.includes(Channel.Email);
    const includesWhatsApp = channels.includes(Channel.WhatsApp);

    let emailProviderContext = null;
    if (includesEmail) {
      emailProviderContext = await getActiveProvider();
      if (!emailProviderContext && !includesWhatsApp) {
        throw new NoActiveEmailProviderError();
      }
    }

    // Claim atômico: transiciona draft → sent; aborta se outra requisição concurrent chegou primeiro.
    const claimed = await claimDraftCampaignForDispatch(campaignId);
    if (!claimed) {
      throw new CampaignValidationError(
        "Apenas campanhas em rascunho podem ser enviadas agora",
      );
    }

    const items: DispatchResultItem[] = [];

    if (includesWhatsApp) {
      for (const recipient of recipients) {
        const waRecipient: WhatsAppRecipient = {
          contactId: recipient.id,
          telefone: recipient.telefone,
          nome: recipient.nome,
        };
        const result = processWhatsAppRecipient(waRecipient, content);
        const status = result.success ? SendStatus.Enviado : SendStatus.Falha;
        const returnMessage = result.success ? result.message : result.message;

        await recordHistory(
          {
            campaignId,
            userId: actorId,
            channel: Channel.WhatsApp,
            recipient: result.recipient,
            status,
            returnMessage,
          },
          historyWriter,
        );

        items.push({
          channel: Channel.WhatsApp,
          recipient: result.recipient,
          contactId: recipient.id,
          status,
          returnMessage,
        });
      }
    }

    if (includesEmail) {
      if (!emailProviderContext) {
        for (const recipient of recipients) {
          await recordHistory(
            {
              campaignId,
              userId: actorId,
              channel: Channel.Email,
              recipient: recipient.email?.trim() || recipient.id,
              status: SendStatus.Falha,
              returnMessage: NO_EMAIL_PROVIDER_MESSAGE,
            },
            historyWriter,
          );

          items.push({
            channel: Channel.Email,
            recipient: recipient.email?.trim() || recipient.id,
            contactId: recipient.id,
            status: SendStatus.Falha,
            returnMessage: NO_EMAIL_PROVIDER_MESSAGE,
          });
        }
      } else {
        const subject = buildEmailSubject(content);

        for (const recipient of recipients) {
          const email = recipient.email?.trim();
          if (!email) {
            const returnMessage = "Email ausente";
            await recordHistory(
              {
                campaignId,
                userId: actorId,
                channel: Channel.Email,
                recipient: recipient.id,
                status: SendStatus.Falha,
                returnMessage,
              },
              historyWriter,
            );

            items.push({
              channel: Channel.Email,
              recipient: recipient.id,
              contactId: recipient.id,
              status: SendStatus.Falha,
              returnMessage,
            });
            continue;
          }

          const sendResult = await sendEmail(
            { to: email, subject, content },
            emailProviderContext,
          );

          const status = sendResult.success
            ? SendStatus.Enviado
            : SendStatus.Falha;
          const returnMessage = sendResult.messageId
            ? `${sendResult.message}${sendResult.messageId ? ` (id: ${sendResult.messageId})` : ""}`
            : sendResult.message;

          await recordHistory(
            {
              campaignId,
              userId: actorId,
              channel: Channel.Email,
              recipient: email,
              status,
              returnMessage,
            },
            historyWriter,
          );

          items.push({
            channel: Channel.Email,
            recipient: email,
            contactId: recipient.id,
            status,
            returnMessage,
          });
        }
      }
    }

    const success = items.filter(
      (item) => item.status === SendStatus.Enviado,
    ).length;
    const failure = items.length - success;

    await auditLog({
      actorId,
      action:
        failure === items.length ? "campaign.send.failed" : "campaign.sent",
      entity: "Campaign",
      entityId: campaignId,
      payload: {
        channels,
        recipients: recipients.length,
        total: items.length,
        success,
        failure,
      },
    });

    return {
      campaignId,
      items,
      summary: {
        total: items.length,
        success,
        failure,
      },
    };
  }
}

let defaultChannelDispatchService: ChannelDispatchService | null = null;

export function getChannelDispatchService(): ChannelDispatchService {
  if (!defaultChannelDispatchService) {
    defaultChannelDispatchService = new ChannelDispatchService();
  }
  return defaultChannelDispatchService;
}

export function setChannelDispatchServiceForTests(
  service: ChannelDispatchService | null,
): void {
  defaultChannelDispatchService = service;
}
