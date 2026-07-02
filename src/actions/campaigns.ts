"use server";

// Server Actions do módulo de campanhas — protegidas por RBAC no servidor.
import { z } from "zod";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth-errors";
import {
  CampaignValidationError,
  CampaignWizardError,
} from "@/lib/campaign-errors";
import { NoActiveEmailProviderError, SendingError } from "@/lib/sending-errors";
import {
  campaignListFiltersSchema,
  campaignWizardStateSchema,
  formatZodValidationError,
  type CampaignListFiltersInput,
  type CampaignWizardStateInput,
  type WizardStep,
} from "@/schemas/campaign";
import { requirePermission } from "@/services/auth";
import {
  getCampaignService,
  type CampaignDto,
  type CampaignListResponse,
} from "@/services/campaigns";
import {
  getChannelDispatchService,
  type DispatchCampaignResult,
} from "@/services/channel-dispatch";

type ActionError = { success: false; error: string; status?: number };
type ActionSuccess<T> = { success: true; data: T };

export type CampaignActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: error.message, status: 401 };
  }
  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message, status: 403 };
  }
  if (error instanceof CampaignValidationError) {
    return { success: false, error: error.message };
  }
  if (error instanceof CampaignWizardError) {
    return { success: false, error: error.message };
  }
  if (error instanceof NoActiveEmailProviderError) {
    return { success: false, error: error.message };
  }
  if (error instanceof SendingError) {
    return { success: false, error: error.message };
  }
  if (error instanceof z.ZodError) {
    return { success: false, error: formatZodValidationError(error) };
  }
  return { success: false, error: "Não foi possível concluir a operação." };
}

export async function listCampaignsAction(
  filters: CampaignListFiltersInput,
): Promise<CampaignActionResult<CampaignListResponse>> {
  try {
    await requirePermission("campaigns:read");
    const parsed = campaignListFiltersSchema.parse(filters);
    const data = await getCampaignService().listCampaigns(parsed);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function getCampaignAction(
  id: string,
): Promise<CampaignActionResult<CampaignDto>> {
  try {
    await requirePermission("campaigns:read");
    const campaign = await getCampaignService().getCampaignById(id);
    if (!campaign) {
      return { success: false, error: "Campanha não encontrada" };
    }
    return { success: true, data: campaign };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function createCampaignDraftAction(
  nome: string,
): Promise<CampaignActionResult<CampaignDto>> {
  try {
    const user = await requirePermission("campaigns:write");
    const data = await getCampaignService().createDraft(nome, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function saveCampaignDraftAction(
  id: string,
  state: CampaignWizardStateInput,
): Promise<CampaignActionResult<CampaignDto>> {
  try {
    const user = await requirePermission("campaigns:write");
    const parsed = campaignWizardStateSchema.safeParse(state);
    if (!parsed.success) {
      return { success: false, error: formatZodValidationError(parsed.error) };
    }
    const data = await getCampaignService().saveDraft(id, parsed.data, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function advanceCampaignWizardStepAction(
  id: string,
  currentStep: WizardStep,
  stepData: Record<string, unknown>,
): Promise<
  CampaignActionResult<{ campaign: CampaignDto; nextStep: WizardStep | null }>
> {
  try {
    const user = await requirePermission("campaigns:write");
    const data = await getCampaignService().advanceWizardStep(
      id,
      currentStep,
      stepData,
      user.id,
    );
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function scheduleCampaignAction(
  id: string,
  scheduledAt: string,
): Promise<CampaignActionResult<CampaignDto>> {
  try {
    const user = await requirePermission("campaigns:send");
    const data = await getCampaignService().scheduleCampaign(
      id,
      scheduledAt,
      user.id,
    );
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function cancelScheduledCampaignAction(
  id: string,
): Promise<CampaignActionResult<CampaignDto>> {
  try {
    const user = await requirePermission("campaigns:send");
    const data = await getCampaignService().cancelScheduledCampaign(
      id,
      user.id,
    );
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function rescheduleCampaignAction(
  id: string,
  scheduledAt: string,
): Promise<CampaignActionResult<CampaignDto>> {
  try {
    const user = await requirePermission("campaigns:send");
    const data = await getCampaignService().rescheduleCampaign(
      id,
      scheduledAt,
      user.id,
    );
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function duplicateCampaignAction(
  id: string,
): Promise<CampaignActionResult<CampaignDto>> {
  try {
    const user = await requirePermission("campaigns:write");
    const data = await getCampaignService().duplicateCampaign(id, user.id);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteCampaignAction(
  id: string,
): Promise<CampaignActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("campaigns:write");
    await getCampaignService().deleteCampaign(id, user.id);
    return { success: true, data: { id } };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function sendCampaignAction(
  id: string,
): Promise<CampaignActionResult<DispatchCampaignResult>> {
  try {
    const user = await requirePermission("campaigns:send");
    const data = await getChannelDispatchService().dispatchCampaign(
      id,
      user.id,
    );
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function resendCampaignAction(
  id: string,
): Promise<CampaignActionResult<DispatchCampaignResult>> {
  try {
    const user = await requirePermission("campaigns:send");
    const copy = await getCampaignService().resendCampaign(id, user.id);

    try {
      const data = await getChannelDispatchService().dispatchCampaign(
        copy.id,
        user.id,
      );
      return { success: true, data };
    } catch (dispatchError) {
      await getCampaignService().deleteCampaign(copy.id, user.id);
      throw dispatchError;
    }
  } catch (error) {
    return mapActionError(error);
  }
}

export type { CampaignDto, CampaignListResponse, DispatchCampaignResult };
