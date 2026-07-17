// Runner de campanhas agendadas — busca vencidas, reivindica e dispara via `sending`.
import { CampaignValidationError } from "@/lib/campaign-errors";
import { auditLog } from "@/services/audit-log";
import {
  claimScheduledCampaign,
  clearCampaignSchedule,
  findDueScheduledCampaigns,
} from "@/repositories/campaign";
import { getChannelDispatchService } from "@/services/channel-dispatch";
import type { DispatchCampaignResult } from "@/services/channel-dispatch";

export type ScheduleRunnerItemResult = {
  campaignId: string;
  outcome: "dispatched" | "skipped" | "failed";
  error?: string;
  dispatch?: DispatchCampaignResult;
};

export type ScheduleRunnerResult = {
  processed: number;
  dispatched: number;
  skipped: number;
  failed: number;
  items: ScheduleRunnerItemResult[];
};

const SYSTEM_ACTOR_ID = "system-schedule-runner";

export class ScheduleRunnerService {
  constructor(
    private readonly deps: {
      findDue?: typeof findDueScheduledCampaigns;
      claim?: typeof claimScheduledCampaign;
      clearSchedule?: typeof clearCampaignSchedule;
      dispatch?: (
        campaignId: string,
        actorId: string,
      ) => Promise<DispatchCampaignResult>;
    } = {},
  ) {}

  async runDueCampaigns(limit = 50): Promise<ScheduleRunnerResult> {
    const findDue = this.deps.findDue ?? findDueScheduledCampaigns;
    const claim = this.deps.claim ?? claimScheduledCampaign;
    const clearSchedule = this.deps.clearSchedule ?? clearCampaignSchedule;
    const dispatch =
      this.deps.dispatch ??
      ((campaignId, actorId) =>
        getChannelDispatchService().dispatchCampaign(campaignId, actorId));

    const dueCampaigns = await findDue(limit);
    const items: ScheduleRunnerItemResult[] = [];

    for (const campaign of dueCampaigns) {
      const claimed = await claim(campaign.id);
      if (!claimed) {
        items.push({
          campaignId: campaign.id,
          outcome: "skipped",
        });
        continue;
      }

      const actorId = campaign.creatorId ?? SYSTEM_ACTOR_ID;

      try {
        const dispatchResult = await dispatch(campaign.id, actorId);

        await auditLog({
          actorId,
          action: "campaign.scheduled_sent",
          entity: "Campaign",
          entityId: campaign.id,
          payload: {
            scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
            summary: dispatchResult.summary,
          },
        });

        items.push({
          campaignId: campaign.id,
          outcome: "dispatched",
          dispatch: dispatchResult,
        });
      } catch (error) {
        const message =
          error instanceof CampaignValidationError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Falha ao enviar campanha agendada";

        await auditLog({
          actorId,
          action: "campaign.scheduled_send_failed",
          entity: "Campaign",
          entityId: campaign.id,
          payload: {
            scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
            error: message,
          },
        });

        // O claim já transicionou a campanha para `draft`; sem isto, `scheduledAt`
        // continuaria com a data vencida mesmo fora do fluxo de agendamento.
        await clearSchedule(campaign.id);

        items.push({
          campaignId: campaign.id,
          outcome: "failed",
          error: message,
        });
      }
    }

    const dispatched = items.filter(
      (item) => item.outcome === "dispatched",
    ).length;
    const skipped = items.filter((item) => item.outcome === "skipped").length;
    const failed = items.filter((item) => item.outcome === "failed").length;

    return {
      processed: items.length,
      dispatched,
      skipped,
      failed,
      items,
    };
  }
}

let defaultScheduleRunnerService: ScheduleRunnerService | null = null;

export function getScheduleRunnerService(): ScheduleRunnerService {
  if (!defaultScheduleRunnerService) {
    defaultScheduleRunnerService = new ScheduleRunnerService();
  }
  return defaultScheduleRunnerService;
}

export function setScheduleRunnerServiceForTests(
  service: ScheduleRunnerService | null,
): void {
  defaultScheduleRunnerService = service;
}
