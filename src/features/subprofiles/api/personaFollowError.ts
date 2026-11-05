import { ApiError } from "../../../shared/api/client";
import { isAccountRestricted } from "../../../shared/api/errorMessage";

/** The 400 the follow route answers when the viewer tries to follow a persona
 *  they made or belong to. */
export const PERSONA_SELF_FOLLOW_CODE = "PERSONA_SELF_FOLLOW";

/** The 404 the follow routes answer when the persona is missing, a draft,
 *  members-only, removed or hidden from this viewer. */
export const PERSONA_NOT_FOLLOWABLE_CODE = "PERSONA_NOT_FOLLOWABLE";

/** Shown when the failure carries no reason we can name. */
export const PERSONA_FOLLOW_FALLBACK_KEY = "subprofiles:hero.follow.error";

/** The typed `code` off a refused follow call, read from the parsed body. */
function followErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  return typeof code === "string" ? code : null;
}

/**
 * The catalog key that names why a follow or an unfollow was refused: the
 * viewer's own persona, a persona that takes no follows, or a moderation
 * restriction on the account. Anything else (an outage, a timeout) reads the
 * existing retry line.
 */
export function personaFollowErrorKey(error: unknown): string {
  if (isAccountRestricted(error)) return "shared:apiError.accountRestricted";
  switch (followErrorCode(error)) {
    case PERSONA_SELF_FOLLOW_CODE:
      return "subprofiles:directory.card.followError.ownPersona";
    case PERSONA_NOT_FOLLOWABLE_CODE:
      return "subprofiles:directory.card.followError.notFollowable";
    default:
      return PERSONA_FOLLOW_FALLBACK_KEY;
  }
}
