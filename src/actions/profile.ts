"use server";

import {
  mapActionError as mapActionErrorBase,
  type ActionError,
  type ActionSuccess,
} from "@/lib/action-error";
import { ProfileValidationError } from "@/lib/profile-errors";
import type {
  ChangePasswordInput,
  UpdateProfileInput,
} from "@/schemas/profile";
import { requireAuth } from "@/services/auth";
import { getProfileService, type ProfileDto } from "@/services/profile";

export type ProfileActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  return mapActionErrorBase(error, {
    knownErrors: [ProfileValidationError],
  });
}

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<ProfileActionResult<ProfileDto>> {
  try {
    const user = await requireAuth();
    const data = await getProfileService().updateProfile(user.id, input);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ProfileActionResult<{ success: true }>> {
  try {
    const user = await requireAuth();
    await getProfileService().changePassword(user.id, input);
    return { success: true, data: { success: true } };
  } catch (error) {
    return mapActionError(error);
  }
}
