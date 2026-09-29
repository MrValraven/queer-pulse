import { ApiError } from "../../../shared/api/client";

/** The typed code the server puts in a 409 body when a persona save carried an
 *  `expectedEditVersion` that no longer matches the stored one (ENG-451). */
export const PERSONA_EDIT_CONFLICT_CODE = "PERSONA_EDIT_CONFLICT";

/** The 409 body of a persona edit conflict. */
export interface PersonaEditConflictBody {
  code: typeof PERSONA_EDIT_CONFLICT_CODE;
  currentEditVersion: number;
}

/**
 * Whether a failed persona save was refused because someone else (a co-owner,
 * or this owner in another tab) saved the persona after this editor loaded it.
 * Reads the typed `code` off the parsed 4xx body the same way the other
 * feature error helpers do (`firstContactError.ts`, `spaceRequestError.ts`).
 * Any other 409 (a taken handle, say) reads false.
 */
export function isPersonaEditConflict(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  return code === PERSONA_EDIT_CONFLICT_CODE;
}
