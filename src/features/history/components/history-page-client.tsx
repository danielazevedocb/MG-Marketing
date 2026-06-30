"use client";

import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import {
  exportAuditLogsCsvAction,
  exportSendHistoryCsvAction,
  getHistoryFilterOptionsAction,
  listAuditLogsAction,
  listSendHistoryAction,
  type AuditLogListResponse,
  type SendHistoryListResponse,
} from "@/actions/history";
import { Button } from "@/components/ui/button";
import { AuditLogFilters } from "@/features/history/components/audit-log-filters";
import { AuditLogList } from "@/features/history/components/audit-log-list";
import { SendHistoryFilters } from "@/features/history/components/send-history-filters";
import { SendHistoryList } from "@/features/history/components/send-history-list";
import { downloadCsvContent } from "@/features/history/lib/download-csv";
import type {
  AuditLogFiltersInput,
  SendHistoryFiltersInput,
} from "@/schemas/history";

type HistoryTab = "send" | "audit";

type HistoryPageClientProps = {
  canAudit: boolean;
  initialTab?: HistoryTab;
};

const defaultSendFilters: SendHistoryFiltersInput = {
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: 20,
};

const defaultAuditFilters: AuditLogFiltersInput = {
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: 20,
};

export function HistoryPageClient({
  canAudit,
  initialTab = "send",
}: HistoryPageClientProps) {
  const [tab, setTab] = useState<HistoryTab>(
    canAudit ? initialTab : "send",
  );
  const [sendFilters, setSendFilters] =
    useState<SendHistoryFiltersInput>(defaultSendFilters);
  const [auditFilters, setAuditFilters] =
    useState<AuditLogFiltersInput>(defaultAuditFilters);
  const [isExporting, startExport] = useTransition();

  const filterOptionsQuery = useQuery({
    queryKey: ["history-filter-options"],
    queryFn: async () => {
      const result = await getHistoryFilterOptionsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const sendQueryFilters = useMemo(() => sendFilters, [sendFilters]);

  const sendHistoryQuery = useQuery({
    queryKey: ["send-history", sendQueryFilters],
    queryFn: async () => {
      const result = await listSendHistoryAction(sendQueryFilters);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: tab === "send",
  });

  const auditQueryFilters = useMemo(() => auditFilters, [auditFilters]);

  const auditLogsQuery = useQuery({
    queryKey: ["audit-logs", auditQueryFilters],
    queryFn: async () => {
      const result = await listAuditLogsAction(auditQueryFilters);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: tab === "audit" && canAudit,
  });

  function handleSendFiltersChange(next: Partial<SendHistoryFiltersInput>) {
    setSendFilters((current) => ({
      ...current,
      ...next,
      page: next.page ?? 1,
    }));
  }

  function handleAuditFiltersChange(next: Partial<AuditLogFiltersInput>) {
    setAuditFilters((current) => ({
      ...current,
      ...next,
      page: next.page ?? 1,
    }));
  }

  function handleExportSendHistory() {
    startExport(async () => {
      const { dateFrom, dateTo, channel, status, userId, campaignId } =
        sendFilters;
      const result = await exportSendHistoryCsvAction({
        dateFrom,
        dateTo,
        channel,
        status,
        userId,
        campaignId,
      });
      if (!result.success) return;
      downloadCsvContent(result.data.csv, result.data.filename);
    });
  }

  function handleExportAuditLogs() {
    startExport(async () => {
      const { dateFrom, dateTo, actorId, action, entity, entityId } =
        auditFilters;
      const result = await exportAuditLogsCsvAction({
        dateFrom,
        dateTo,
        actorId,
        action,
        entity,
        entityId,
      });
      if (!result.success) return;
      downloadCsvContent(result.data.csv, result.data.filename);
    });
  }

  const sendData: SendHistoryListResponse | undefined = sendHistoryQuery.data;
  const auditData: AuditLogListResponse | undefined = auditLogsQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={tab === "send" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("send")}
        >
          Histórico de envios
        </Button>
        {canAudit ? (
          <Button
            type="button"
            variant={tab === "audit" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("audit")}
          >
            Logs de auditoria
          </Button>
        ) : null}
      </div>

      {tab === "send" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <SendHistoryFilters
              filters={sendFilters}
              options={filterOptionsQuery.data}
              onChange={handleSendFiltersChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={handleExportSendHistory}
              className="shrink-0"
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </div>

          <SendHistoryList
            items={sendData?.items ?? []}
            total={sendData?.total ?? 0}
            page={sendData?.page ?? 1}
            pageSize={sendData?.pageSize ?? 20}
            isLoading={
              sendHistoryQuery.isLoading || sendHistoryQuery.isFetching
            }
            error={sendHistoryQuery.error?.message}
            onPageChange={(page) => handleSendFiltersChange({ page })}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <AuditLogFilters
              filters={auditFilters}
              options={filterOptionsQuery.data}
              onChange={handleAuditFiltersChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={handleExportAuditLogs}
              className="shrink-0"
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </div>

          <AuditLogList
            items={auditData?.items ?? []}
            total={auditData?.total ?? 0}
            page={auditData?.page ?? 1}
            pageSize={auditData?.pageSize ?? 20}
            isLoading={auditLogsQuery.isLoading || auditLogsQuery.isFetching}
            error={auditLogsQuery.error?.message}
            onPageChange={(page) => handleAuditFiltersChange({ page })}
          />
        </div>
      )}
    </div>
  );
}
