// Serviço de histórico de envios e logs de auditoria — consulta, filtros e exportação.
import {
  listAuditFilterActors,
  listAuditLogs,
  listAuditLogsForExport,
  type AuditLogListItem,
} from "@/repositories/audit-log";
import {
  listSendHistory,
  listSendHistoryForExport,
  type SendHistoryListItem,
} from "@/repositories/send-history";
import { listCampaigns } from "@/repositories/campaign";
import {
  auditLogExportFiltersSchema,
  auditLogFiltersSchema,
  sendHistoryExportFiltersSchema,
  sendHistoryFiltersSchema,
  type AuditLogExportFiltersInput,
  type AuditLogFiltersInput,
  type SendHistoryExportFiltersInput,
  type SendHistoryFiltersInput,
} from "@/schemas/history";
import { CHANNEL_LABELS } from "@/schemas/campaign";
import { SEND_STATUS_LABELS } from "@/schemas/history";
import { recordsToCsv } from "@/utils/csv-export";

export type SendHistoryDto = {
  id: string;
  sentAt: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  campaignId: string | null;
  campaignName: string | null;
  channel: SendHistoryListItem["channel"];
  recipient: string;
  status: SendHistoryListItem["status"];
  returnMessage: string | null;
};

export type SendHistoryListResponse = {
  items: SendHistoryDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AuditLogDto = {
  id: string;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  payload: unknown;
};

export type AuditLogListResponse = {
  items: AuditLogDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type HistoryFilterOptions = {
  campaigns: Array<{ id: string; nome: string }>;
  users: Array<{ id: string; name: string | null; email: string }>;
  actors: Array<{ id: string; name: string | null; email: string }>;
};

function parseDateBoundary(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

function toSendHistoryDto(item: SendHistoryListItem): SendHistoryDto {
  return {
    id: item.id,
    sentAt: item.sentAt.toISOString(),
    userId: item.userId,
    userName: item.userName,
    userEmail: item.userEmail,
    campaignId: item.campaignId,
    campaignName: item.campaignName,
    channel: item.channel,
    recipient: item.recipient,
    status: item.status,
    returnMessage: item.returnMessage,
  };
}

function toAuditLogDto(item: AuditLogListItem): AuditLogDto {
  return {
    id: item.id,
    createdAt: item.createdAt.toISOString(),
    actorId: item.actorId,
    actorName: item.actorName,
    actorEmail: item.actorEmail,
    action: item.action,
    entity: item.entity,
    entityId: item.entityId,
    payload: item.payload,
  };
}

function buildSendHistoryQuery(filters: SendHistoryExportFiltersInput) {
  return {
    dateFrom: parseDateBoundary(filters.dateFrom),
    dateTo: parseDateBoundary(filters.dateTo, true),
    channel: filters.channel,
    status: filters.status,
    userId: filters.userId,
    campaignId: filters.campaignId,
  };
}

function buildAuditLogQuery(filters: AuditLogExportFiltersInput) {
  return {
    dateFrom: parseDateBoundary(filters.dateFrom),
    dateTo: parseDateBoundary(filters.dateTo, true),
    actorId: filters.actorId,
    action: filters.action,
    entity: filters.entity,
    entityId: filters.entityId,
  };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

function formatPayload(payload: unknown): string {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

export class HistoryService {
  async listSendHistory(
    filters: SendHistoryFiltersInput,
  ): Promise<SendHistoryListResponse> {
    const parsed = sendHistoryFiltersSchema.parse(filters);
    const skip = (parsed.page - 1) * parsed.pageSize;

    const result = await listSendHistory({
      ...buildSendHistoryQuery(parsed),
      skip,
      take: parsed.pageSize,
    });

    return {
      items: result.items.map(toSendHistoryDto),
      total: result.total,
      page: parsed.page,
      pageSize: parsed.pageSize,
    };
  }

  async exportSendHistoryCsv(filters: SendHistoryExportFiltersInput): Promise<string> {
    const parsed = sendHistoryExportFiltersSchema.parse(filters);
    const items = await listSendHistoryForExport(buildSendHistoryQuery(parsed));
    const rows = items.map(toSendHistoryDto);

    return recordsToCsv(rows, [
      { key: "sentAt", header: "Data/Hora", format: (value) => formatDateTime(String(value)) },
      { key: "userName", header: "Usuário", format: (value, row) => String(value ?? row.userEmail ?? "") },
      { key: "campaignName", header: "Campanha" },
      { key: "channel", header: "Canal", format: (value) => CHANNEL_LABELS[value as keyof typeof CHANNEL_LABELS] ?? String(value) },
      { key: "recipient", header: "Destinatário" },
      { key: "status", header: "Status", format: (value) => SEND_STATUS_LABELS[value as keyof typeof SEND_STATUS_LABELS] ?? String(value) },
      { key: "returnMessage", header: "Mensagem de retorno" },
    ]);
  }

  async listAuditLogs(filters: AuditLogFiltersInput): Promise<AuditLogListResponse> {
    const parsed = auditLogFiltersSchema.parse(filters);
    const skip = (parsed.page - 1) * parsed.pageSize;

    const result = await listAuditLogs({
      ...buildAuditLogQuery(parsed),
      skip,
      take: parsed.pageSize,
    });

    return {
      items: result.items.map(toAuditLogDto),
      total: result.total,
      page: parsed.page,
      pageSize: parsed.pageSize,
    };
  }

  async exportAuditLogsCsv(filters: AuditLogExportFiltersInput): Promise<string> {
    const parsed = auditLogExportFiltersSchema.parse(filters);
    const items = await listAuditLogsForExport(buildAuditLogQuery(parsed));
    const rows = items.map(toAuditLogDto);

    return recordsToCsv(rows, [
      { key: "createdAt", header: "Data/Hora", format: (value) => formatDateTime(String(value)) },
      { key: "actorName", header: "Ator", format: (value, row) => String(value ?? row.actorEmail ?? "") },
      { key: "action", header: "Ação" },
      { key: "entity", header: "Entidade" },
      { key: "entityId", header: "ID da entidade" },
      { key: "payload", header: "Payload", format: (value) => formatPayload(value) },
    ]);
  }

  async getFilterOptions(): Promise<HistoryFilterOptions> {
    const [campaignResult, actors] = await Promise.all([
      listCampaigns({ take: 500 }),
      listAuditFilterActors(),
    ]);

    return {
      campaigns: campaignResult.items.map((campaign) => ({
        id: campaign.id,
        nome: campaign.nome,
      })),
      users: actors,
      actors,
    };
  }
}

let historyService: HistoryService | null = null;

export function getHistoryService(): HistoryService {
  if (!historyService) {
    historyService = new HistoryService();
  }
  return historyService;
}

export function resetHistoryServiceForTests(): void {
  historyService = null;
}
