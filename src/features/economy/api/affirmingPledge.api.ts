import { ApiError, apiGet, apiPost } from "../../../shared/api/client";

/** The pledge revision in force. Kept in lockstep with the backend constant
 * `CURRENT_AFFIRMING_PLEDGE_VERSION`. */
export const AFFIRMING_PLEDGE_VERSION = "1.0";

/** The caller's affirming-pledge standing, mirrored from the backend. */
export interface AffirmingPledgeStatusDTO {
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
}

/**
 * Reads an `AFFIRMING_PLEDGE_REQUIRED` 403 body and returns `true` when a gated
 * housing action needs the pledge, so the caller can open the pledge prompt and
 * retry once accepted. Returns `false` for any other error (the caller handles
 * it normally). Mirrors `verificationRequiredFrom` — the backend emits
 * `{ code: "AFFIRMING_PLEDGE_REQUIRED" }` from its gate.
 */
export function affirmingPledgeRequiredFrom(error: unknown): boolean {
  if (error instanceof ApiError && error.status === 403) {
    const data = error.data as { code?: string } | undefined;
    return data?.code === "AFFIRMING_PLEDGE_REQUIRED";
  }
  return false;
}

export const getAffirmingPledgeStatus = () =>
  apiGet<AffirmingPledgeStatusDTO>("/housing/affirming-pledge");

export const acceptAffirmingPledge = () =>
  apiPost<AffirmingPledgeStatusDTO>("/housing/affirming-pledge", {});
