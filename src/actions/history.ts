"use server";

import {
  mapActionError as mapActionErrorBase,
  type ActionError,
  type ActionSuccess,
} from "@/lib/action-error";
import type {
  AuditLogExportFiltersInput,
  AuditLogFiltersInput,
  SendHistoryExportFiltersInput,
  SendHistoryFiltersInput,
} from "@/schemas/history";
import { requirePermission } from "@/services/auth";
import {
  getHistoryService,
  type AuditLogListResponse,
  type HistoryFilterOptions,
  type SendHistoryListResponse,
} from "@/services/history";

export type HistoryActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  return mapActionErrorBase(error);
}

export async function listSendHistoryAction(
  filters: SendHistoryFiltersInput,
): Promise<HistoryActionResult<SendHistoryListResponse>> {
  try {
    await requirePermission("history:read");
    const data = await getHistoryService().listSendHistory(filters);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function exportSendHistoryCsvAction(
  filters: SendHistoryExportFiltersInput,
): Promise<HistoryActionResult<{ csv: string; filename: string }>> {
  try {
    await requirePermission("history:read");
    const csv = await getHistoryService().exportSendHistoryCsv(filters);
    const filename = `historico-envios-${new Date().toISOString().slice(0, 10)}.csv`;
    return { success: true, data: { csv, filename } };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function listAuditLogsAction(
  filters: AuditLogFiltersInput,
): Promise<HistoryActionResult<AuditLogListResponse>> {
  try {
    await requirePermission("audit:read");
    const data = await getHistoryService().listAuditLogs(filters);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function exportAuditLogsCsvAction(
  filters: AuditLogExportFiltersInput,
): Promise<HistoryActionResult<{ csv: string; filename: string }>> {
  try {
    await requirePermission("audit:read");
    const csv = await getHistoryService().exportAuditLogsCsv(filters);
    const filename = `logs-auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    return { success: true, data: { csv, filename } };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function getHistoryFilterOptionsAction(): Promise<
  HistoryActionResult<HistoryFilterOptions>
> {
  try {
    await requirePermission("history:read");
    const data = await getHistoryService().getFilterOptions();
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export type {
  AuditLogDto,
  AuditLogListResponse,
  HistoryFilterOptions,
  SendHistoryDto,
  SendHistoryListResponse,
} from "@/services/history";
