import { ApiError } from "../../shared/api/client";
import { studioSafetyErrorCodeOf } from "./api/studioSafety.api";
import {
  STUDIO_CLAIM_LIMITS,
  type CreateStudioClaimBody,
  type StudioClaimantRole,
} from "./api/studioSafety.types";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

/** What the claim form holds before it sends (spec 8). */
export interface StudioClaimDraft {
  claimantRole: StudioClaimantRole | null;
  originalWork: string;
  originalLink: string;
  details: string;
  isGoodFaith: boolean;
}

export const EMPTY_CLAIM_DRAFT: StudioClaimDraft = {
  claimantRole: null,
  originalWork: "",
  originalLink: "",
  details: "",
  isGoodFaith: false,
};

/** One catalog key per field that still needs the member. */
export type StudioClaimDraftErrors = Partial<
  Record<keyof StudioClaimDraft, string>
>;

const ERROR = "studio:claims.form.error";

/** An https web address and nothing else (the server refuses every other
 *  scheme, plain http included). */
export function isHttpsLink(link: string): boolean {
  if (!/^https:\/\/\S+$/i.test(link)) return false;
  try {
    return new URL(link).protocol === "https:";
  } catch {
    return false;
  }
}

export function claimDraftErrors(
  draft: StudioClaimDraft,
): StudioClaimDraftErrors {
  const errors: StudioClaimDraftErrors = {};
  const originalWork = draft.originalWork.trim();
  const originalLink = draft.originalLink.trim();
  const details = draft.details.trim();
  if (draft.claimantRole === null)
    errors.claimantRole = `${ERROR}.roleRequired`;
  if (!originalWork) errors.originalWork = `${ERROR}.originalWorkRequired`;
  else if (originalWork.length > STUDIO_CLAIM_LIMITS.originalWorkMax)
    errors.originalWork = `${ERROR}.originalWorkTooLong`;
  if (originalLink.length > STUDIO_CLAIM_LIMITS.originalLinkMax)
    errors.originalLink = `${ERROR}.linkTooLong`;
  else if (originalLink && !isHttpsLink(originalLink))
    errors.originalLink = `${ERROR}.linkInvalid`;
  if (!details) errors.details = `${ERROR}.detailsRequired`;
  else if (details.length > STUDIO_CLAIM_LIMITS.detailsMax)
    errors.details = `${ERROR}.detailsTooLong`;
  if (!draft.isGoodFaith) errors.isGoodFaith = `${ERROR}.goodFaithRequired`;
  return errors;
}

/** The body to send, or null while any field still needs the member. */
export function claimBodyOf(
  draft: StudioClaimDraft,
): CreateStudioClaimBody | null {
  if (draft.claimantRole === null) return null;
  if (Object.keys(claimDraftErrors(draft)).length > 0) return null;
  return {
    claimantRole: draft.claimantRole,
    originalWork: draft.originalWork.trim(),
    originalLink: draft.originalLink.trim() || null,
    details: draft.details.trim(),
    goodFaith: true,
  };
}

/** The line a refused send shows: the throttle (429) and a track that is
 *  gone (uncoded 404) have their own; every coded refusal reads its code. */
export function claimSubmitErrorKeyOf(error: unknown): string {
  if (error instanceof ApiError && error.status === 429)
    return "studio:claims.form.throttled";
  if (
    error instanceof ApiError &&
    error.status === 404 &&
    studioSafetyErrorCodeOf(error) === null
  )
    return "studio:claims.form.trackGone";
  return studioErrorMessageKeyOf(error);
}
