import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../../shared/api/causeErrorKey";

/** The 400 the follow route answers when the viewer tries to follow a persona
 *  they made or belong to. */
export const PERSONA_SELF_FOLLOW_CODE = "PERSONA_SELF_FOLLOW";

/** The 404 the follow routes answer when the persona is missing, a draft,
 *  members-only, removed or hidden from this viewer. */
export const PERSONA_NOT_FOLLOWABLE_CODE = "PERSONA_NOT_FOLLOWABLE";

/** The follow routes' own coded refusals; everything else reads the shared
 *  cause for its status. */
const FOLLOW_OVERRIDES: CauseErrorOverrides = {
  [PERSONA_SELF_FOLLOW_CODE]:
    "subprofiles:directory.card.followError.ownPersona",
  [PERSONA_NOT_FOLLOWABLE_CODE]:
    "subprofiles:directory.card.followError.notFollowable",
};

/**
 * The catalog key (and values) that names why a follow or an unfollow was
 * refused: the viewer's own persona, a persona that takes no follows, a
 * moderation restriction on the account, or the shared cause for the failure
 * (no connection, signed out, a rate limit, a server fault). Resolve with
 * `t(copy.key, copy.values)`.
 */
export function personaFollowErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, FOLLOW_OVERRIDES);
}
