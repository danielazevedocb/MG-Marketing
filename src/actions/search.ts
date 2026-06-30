"use server";

import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth-errors";
import { globalSearchSchema, type GlobalSearchInput } from "@/schemas/search";
import { requireAuth } from "@/services/auth";
import {
  globalSearch,
  type GlobalSearchResponse,
} from "@/services/search";

type ActionError = { success: false; error: string; status?: number };
type ActionSuccess<T> = { success: true; data: T };

export type SearchActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: error.message, status: 401 };
  }
  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message, status: 403 };
  }
  return { success: false, error: "Não foi possível concluir a busca." };
}

export async function globalSearchAction(
  input: GlobalSearchInput,
): Promise<SearchActionResult<GlobalSearchResponse>> {
  try {
    const user = await requireAuth();
    const parsed = globalSearchSchema.parse(input);
    const data = await globalSearch(parsed, user.role);
    return { success: true, data };
  } catch (error) {
    return mapActionError(error);
  }
}
