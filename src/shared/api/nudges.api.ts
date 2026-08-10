import { apiGet, apiPost } from "./client";
import { apiAvailable } from "./config";
import { logError } from "../observability/logger";

/**
 * Persona-discovery dismissal store (personas Phase 5, Decision §1). Backs the
 * "fire at most once, dismissible for good, cap at 2 dismissals" rule for the
 * six discovery moments, cross-device. Mirrors `consent.api.ts`'s shape.
 */
export const NUDGE_KEYS = [
  "profile_empty",
  "directory_footer",
  "account_badge",
  "onboarding_question",
  "post_gathering",
  "credit_notification",
] as const;

export type NudgeKey = (typeof NUDGE_KEYS)[number];

export interface NudgesResponse {
  dismissedKeys: NudgeKey[];
  /** True once the member has dismissed ≥ 2 distinct nudges (server COUNT). */
  capped: boolean;
}

/** Only round-trip to the backend in live mode, matching `consent.api.ts`. */
const canCallBackend = (demoMode: boolean): boolean =>
  apiAvailable && !demoMode;

/** Current dismissal state for the caller, to reconcile the local mirror on load. */
export async function fetchMyNudges(
  demoMode: boolean,
): Promise<NudgesResponse | null> {
  if (!canCallBackend(demoMode)) return null;
  try {
    return await apiGet<NudgesResponse>("/nudges/me");
  } catch (error) {
    logError(error, { scope: "nudges.fetch" });
    return null;
  }
}

/**
 * Record a dismissal. Idempotent on the backend (`ON CONFLICT DO NOTHING`), so
 * safe to fire-and-forget after the local mirror already updated. Never
 * throws: a failed POST is logged, not surfaced — the dismissal already stuck
 * locally, so the UX can't break.
 */
export async function dismissNudge(
  key: NudgeKey,
  demoMode: boolean,
): Promise<void> {
  if (!canCallBackend(demoMode)) return;
  try {
    await apiPost<void>(`/nudges/${key}/dismiss`);
  } catch (error) {
    logError(error, { scope: "nudges.dismiss", key });
  }
}
