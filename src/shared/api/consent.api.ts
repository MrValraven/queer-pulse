import { ApiError, apiGet, apiPost } from "./client";
import { apiAvailable } from "./config";
import { logError } from "../observability/logger";

/**
 * Consent (spec 07). Versioned, append-only consent records. The privacy policy
 * pins this exact version at consent time (see `PrivacyPage` meta); bumping it
 * re-prompts anyone whose stored choice predates the change.
 *
 * NO LONGER AUTHORITATIVE (ID-14). The backend's
 * `consent/policy-versions.ts` is the single source of truth for every policy
 * revision, and the live value arrives as `privacyPolicyVersion` on the public
 * `GET /platform-status` — which is what `ConsentProvider` actually pins to.
 * This literal survives only as the answer for the moment BEFORE that query
 * resolves (and for demo mode, which never posts a record at all), so the
 * banner has something to compare a stored choice against on first paint
 * instead of flashing.
 *
 * It is `3.4` because that is the revision the privacy page prints and the one
 * already stamped on live records; the backend's stale `3.3` was the half that
 * moved to match, not this one. If you find yourself editing this number, edit
 * the backend constant instead — this one only needs to follow when the gap
 * would otherwise be visible on a cold load.
 */
export const POLICY_VERSION = "3.4";

/**
 * A 401 here is not a fault to report. These endpoints are member-scoped and
 * the providers that call them also run for anonymous visitors, so "not signed
 * in" is an expected answer — logging it sent an error event to monitoring on
 * every logged-out page load.
 */
function isExpectedSignedOut(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/** `necessary` is always on (session/CSRF cookies, theme/i18n prefs). */
export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
  monitoring: boolean;
}

export type ConsentSource = "banner" | "preference_center" | "settings_pane";
export type ConsentAction = "granted" | "updated" | "withdrawn";

export interface ConsentInput {
  anonId?: string;
  categories: ConsentCategories;
  policyVersion: string;
  source: ConsentSource;
}

export interface ConsentRecord {
  categories: ConsentCategories;
  policyVersion: string;
  action: ConsentAction;
  createdAt: string;
}

export interface MyConsentResponse {
  categories: ConsentCategories;
  policyVersion: string;
}

/**
 * Only round-trip to the backend in live mode. In demo mode (or with no backend
 * configured) consent persists locally and never hits the network — matching the
 * `apiAvailable`/`demoMode` split used across the app.
 */
const canCallBackend = (demoMode: boolean): boolean =>
  apiAvailable && !demoMode;

/**
 * Append a consent record. Returns the stored record in live mode, or `null` in
 * demo mode (a deliberate no-op — the local mirror is the source of truth there).
 * Never throws: a failed POST is logged, not surfaced, so consent UX can't break.
 */
export async function recordConsent(
  input: ConsentInput,
  demoMode: boolean,
): Promise<ConsentRecord | null> {
  if (!canCallBackend(demoMode)) return null;
  try {
    return await apiPost<ConsentRecord>("/consent", input);
  } catch (error) {
    if (!isExpectedSignedOut(error)) {
      logError(error, { scope: "consent.record", source: input.source });
    }
    return null;
  }
}

/**
 * The Terms + Community Guidelines revisions a member has agreed to, paired
 * with the ones currently in effect (ID-14). Served on `GET /auth/me` because
 * it is per-member state, and hand-mapped there from `users.terms_version` /
 * `users.guidelines_version` — the two columns that were written once at signup
 * and, until this, never read again.
 *
 * `accepted*` is `null` for an account that predates the columns. That counts
 * as behind: with no evidence the member agreed to anything, the honest move is
 * to ask.
 */
export interface PolicyVersions {
  currentTerms: string;
  currentGuidelines: string;
  acceptedTerms: string | null;
  acceptedGuidelines: string | null;
}

/** What `POST /consent/policy-acceptance` writes back. */
export interface PolicyAcceptanceRecord {
  termsVersion: string;
  guidelinesVersion: string;
  previousTermsVersion: string | null;
  previousGuidelinesVersion: string | null;
  acceptedAt: string;
}

/**
 * Record that the signed-in member has agreed to the policy revisions currently
 * in effect. Sends NO BODY on purpose: the server stamps its own current
 * versions, so a client can never mark itself up to date against a revision
 * that was never published.
 *
 * Unlike `recordConsent` above this DOES throw. Cookie consent can fail
 * silently because the local mirror still governs behaviour; a policy agreement
 * that failed to reach the server has to be reported, or the sheet would close
 * on a promise nothing recorded.
 */
export async function postPolicyAcceptance(): Promise<PolicyAcceptanceRecord> {
  return apiPost<PolicyAcceptanceRecord>("/consent/policy-acceptance", {});
}

/** Current effective consent for the caller, to rehydrate on load. */
export async function fetchMyConsent(
  demoMode: boolean,
): Promise<MyConsentResponse | null> {
  if (!canCallBackend(demoMode)) return null;
  try {
    return await apiGet<MyConsentResponse>("/consent/me");
  } catch (error) {
    if (!isExpectedSignedOut(error))
      logError(error, { scope: "consent.fetch" });
    return null;
  }
}
