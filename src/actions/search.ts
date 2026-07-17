"use server";

import {
  mapActionError as mapActionErrorBase,
  type ActionError,
  type ActionSuccess,
} from "@/lib/action-error";
import { globalSearchSchema, type GlobalSearchInput } from "@/schemas/search";
import { requireAuth } from "@/services/auth";
import { globalSearch, type GlobalSearchResponse } from "@/services/search";

export type SearchActionResult<T> = ActionSuccess<T> | ActionError;

function mapActionError(error: unknown): ActionError {
  return mapActionErrorBase(error, {
    fallbackMessage: "Não foi possível concluir a busca.",
  });
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
