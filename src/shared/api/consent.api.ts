import { apiGet, apiPost } from "./client";
import { apiAvailable } from "./config";
import { logError } from "../observability/logger";

/**
 * Consent (spec 07). Versioned, append-only consent records. The privacy policy
 * pins this exact version at consent time (see `PrivacyPage` meta); bumping it
 * re-prompts anyone whose stored choice predates the change.
 */
export const POLICY_VERSION = "3.4";

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
    logError(error, { scope: "consent.record", source: input.source });
    return null;
  }
}

/** Current effective consent for the caller, to rehydrate on load. */
export async function fetchMyConsent(
  demoMode: boolean,
): Promise<MyConsentResponse | null> {
  if (!canCallBackend(demoMode)) return null;
  try {
    return await apiGet<MyConsentResponse>("/consent/me");
  } catch (error) {
    logError(error, { scope: "consent.fetch" });
    return null;
  }
}
