import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../../shared/api/causeErrorKey";

/**
 * The words a failed safe-space action says. Each map holds only what the
 * action itself can say; every other failure (offline, signed out, a
 * restricted account, an inactive membership, a server fault) reads as the
 * shared `shared:apiError.*` cause. Resolve a result with
 * `t(copy.key, copy.values)`.
 *
 * None of these routes sends a machine `code`, so the status is the whole
 * signal. Where one status has two backend causes the line names both
 * honestly rather than guessing from the English sentence:
 *
 *  - `POST /safe-spaces/:slug/vouch` 400 is either the member's own space or
 *    a space that is neither verified nor under review.
 *  - `POST /safe-spaces/:slug/flag` 400 is either the member's own space or a
 *    space without a badge.
 */
export const SAFE_SPACE_VOUCH_CAUSE_OVERRIDES: CauseErrorOverrides = {
  400: "safety:vouchModal.error.notVouchable",
  404: "safety:spaces.error.gone",
  409: "safety:vouchModal.error.alreadyVouched",
};

/** `POST /safe-spaces/:slug/flag`: 5 flags per 5 minutes, then a 429. */
export const SAFE_SPACE_FLAG_CAUSE_OVERRIDES: CauseErrorOverrides = {
  400: "safety:flag.error.notFlaggable",
  404: "safety:spaces.error.gone",
  429: "safety:flag.error.rateLimited",
};

/** `DELETE /safe-spaces/:slug/flag`: 404 when no open flag of the member's is left. */
export const SAFE_SPACE_FLAG_WITHDRAW_CAUSE_OVERRIDES: CauseErrorOverrides = {
  404: "safety:flag.error.nothingToWithdraw",
};

/** `POST /safe-space-nominations`: 8 nominations per minute, then a 429. */
export const SAFE_SPACE_NOMINATION_CAUSE_OVERRIDES: CauseErrorOverrides = {
  429: "safety:spaces.nominate.error.rateLimited",
};

export function safeSpaceVouchCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, SAFE_SPACE_VOUCH_CAUSE_OVERRIDES);
}

export function safeSpaceFlagCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, SAFE_SPACE_FLAG_CAUSE_OVERRIDES);
}

export function safeSpaceFlagWithdrawCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, SAFE_SPACE_FLAG_WITHDRAW_CAUSE_OVERRIDES);
}

export function safeSpaceNominationCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, SAFE_SPACE_NOMINATION_CAUSE_OVERRIDES);
}
