import {
  causeErrorKey,
  SHARED_CAUSE_KEY,
} from "../../../shared/api/causeErrorKey";

/** The `refused` line without the `{status}` slot, for the Go together
 *  surfaces that hold a bare copy key and render it with `t(key)`. */
export const GO_TOGETHER_REFUSED_KEY = "goTogether:error.refused";

/**
 * The catalog key naming why a Go together write failed when its own coded
 * refusal (`GO_TOGETHER_*`) has no line on the surface: offline, signed out,
 * a restricted account, an inactive membership, a missing target, a rate
 * limit, a timeout or a server fault, each as the shared
 * `shared:apiError.*` cause from `shared/api/causeErrorKey.ts`.
 *
 * Every Go together surface renders its error through a plain `t(key)`, so
 * the one shared line that interpolates a value (`refused`, for a status
 * with no line of its own) maps to `goTogether:error.refused`, which says the
 * same without the number.
 */
export function goTogetherCauseKey(error: unknown): string {
  const copy = causeErrorKey(error);
  return copy.key === SHARED_CAUSE_KEY.refused
    ? GO_TOGETHER_REFUSED_KEY
    : copy.key;
}
