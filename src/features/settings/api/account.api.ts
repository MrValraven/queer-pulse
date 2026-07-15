import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";

/**
 * Account lifecycle contract — GDPR erasure (Art. 17), data portability
 * (Art. 20), DSAR intake (Arts. 15/16/21), and the step-up re-authentication
 * that gates every destructive/export action (Art. 12(6)).
 *
 * The NestJS backend lives outside this repo; the shapes below are the CONTRACT
 * the frontend codes against. All routes are cookie-authenticated + CSRF
 * protected (see `src/shared/api/client.ts`). Errors use the existing
 * `{ message }` / `{ message: string[] }` shape and surface as `ApiError`.
 *
 * Demo/live is handled one layer up in `useAccountMutations.ts` — these are the
 * thin live wrappers only.
 */

/* ────────────────────────────────────────────────────────────────────────
 * Email template catalogue (spec 11 — transactional email).
 *
 * The frontend never SENDS email; it triggers a server action that enqueues a
 * send, then shows an honest pending/"check your inbox" state on the 2xx (never
 * a fake success). Documented here so the trigger endpoints and the templates
 * stay in lockstep. Provider committed in policy: Postmark. All are
 * TRANSACTIONAL (no unsubscribe) unless noted.
 *
 *   Template                     Server trigger (enqueues send)        Key data
 *   ─────────────────────────    ──────────────────────────────────    ─────────────────────────────
 *   security-alert-new-device    new unrecognised session (side-effect) device, location, time
 *   gdpr-deletion-requested      POST  /account/deletion-request       cancel link, grace-end date, scope
 *   gdpr-deletion-cancelled      DELETE /account/deletion-request      confirmation the erase was stopped
 *   gdpr-export-verification     POST  /account/export                 verify link, categories, format
 *   gdpr-export-ready            export worker finishes archive        single-use signed link, 7-day expiry
 *   gdpr-dsar-received           POST  /account/dsar                   reference, 30-day due date
 *   gdpr-dsar-resolved           DSAR closed by staff                  outcome summary, appeal link
 *
 * Idempotency: every send carries a deterministic `messageKey` server-side so a
 * "Resend" re-delivers the SAME keyed message rather than spamming.
 * ──────────────────────────────────────────────────────────────────────── */

/* ── Step-up re-authentication ─────────────────────────────────────────── */

export interface ReauthDto {
  /** For password accounts. Google-only accounts re-consent via OAuth instead. */
  password: string;
}
export interface ReauthResult {
  /** Short-lived, single-purpose token (~5 min) required by destructive/export routes. */
  reauthToken: string;
  expiresAt: string;
}

/** POST /account/reauth — verify identity before any erasure/export action. */
export const reauth = (dto: ReauthDto) =>
  apiPost<ReauthResult>("/account/reauth", dto);

/* ── Right to erasure — account deletion ───────────────────────────────── */

export type DeletionStatus = "grace" | "processing" | "erased";

export interface DeletionRequest {
  id: string;
  status: DeletionStatus;
  requestedAt: string;
  /** When the 30-day grace period ends and irreversible erasure begins. */
  scheduledErasureAt: string;
  gracePeriodDays: number;
}

export interface RequestDeletionDto {
  reason?: string;
  reauthToken: string;
}

/** POST /account/deletion-request — open the 30-day grace period, kill sessions. */
export const requestAccountDeletion = (dto: RequestDeletionDto) =>
  apiPost<DeletionRequest>("/account/deletion-request", dto);

/** GET /account/deletion-request — the pending request, or null when none. */
export const getDeletionRequest = () =>
  apiGet<DeletionRequest | null>("/account/deletion-request");

/** DELETE /account/deletion-request — cancel during grace, reactivate the account. */
export const cancelDeletionRequest = () =>
  apiDelete<void>("/account/deletion-request");

/** POST /account/deactivate — reversible hide (non-erasure path). */
export const deactivateAccount = (dto: { reauthToken: string }) =>
  apiPost<{ status: "deactivated" }>("/account/deactivate", dto);

/* ── Right to portability — data export (async job) ────────────────────── */

export type ExportFormat = "json" | "csv" | "both";
export type ExportStatus =
  "queued" | "processing" | "ready" | "failed" | "expired";

export interface ExportJob {
  jobId: string;
  status: ExportStatus;
  requestedAt: string;
  /** Secure, signed, single-use link — present only once `status === "ready"`. */
  downloadUrl?: string;
  sizeBytes?: number;
  /** 7-day expiry on the download link. */
  expiresAt?: string;
  error?: string;
}

export interface RequestExportDto {
  categories: string[];
  format: ExportFormat;
  /**
   * Optional — Art. 20 export is verified out-of-band by the link emailed to the
   * registered address (the "confirm your identity" step in the UI), so a
   * step-up token isn't collected on this page.
   */
  reauthToken?: string;
}

/** POST /account/export — enqueue the archive build job. */
export const requestExport = (dto: RequestExportDto) =>
  apiPost<ExportJob>("/account/export", dto);

/** GET /account/export/:jobId — poll target for the build job. */
export const getExportJob = (jobId: string) =>
  apiGet<ExportJob>(`/account/export/${jobId}`);

/* ── DSAR intake & tracking (access / rectification / objection) ────────── */

export type DsarArticle = 15 | 16 | 17 | 21;
export type DsarStatus = "received" | "in_review" | "resolved" | "rejected";

export interface DsarRequest {
  reference: string;
  article: DsarArticle;
  status: DsarStatus;
  submittedAt: string;
  /** submittedAt + 30 days (statutory). */
  dueBy: string;
  respondedAt?: string;
}

export interface SubmitDsarDto {
  article: DsarArticle;
  scopes: string[];
  details: string;
  context?: string;
  reauthToken: string;
}

/** POST /account/dsar — file a data-subject request; returns a real reference. */
export const submitDsar = (dto: SubmitDsarDto) =>
  apiPost<DsarRequest>("/account/dsar", dto);

/** GET /account/dsar — the member's real request history. */
export const listDsar = () => apiGet<DsarRequest[]>("/account/dsar");

/* ── Sessions (spec 08 territory — referenced here for the security email) ── */

/**
 * DELETE /account/sessions/:id — revoke one session. A revoke from an
 * unrecognised device is what triggers the "new device / incident" security
 * email (spec 11), so the UI only claims an email is coming after this 2xx.
 */
export const revokeSession = (id: string) =>
  apiDelete<void>(`/account/sessions/${id}`);

/** DELETE /account/sessions — revoke every session except the current one. */
export const revokeOtherSessions = () => apiDelete<void>("/account/sessions");

/* ── Email preferences (spec 11 stub — shared with spec 10 store) ───────── */

export interface EmailPreference {
  /** Matrix row / category key (see notificationPreferences.data.ts). */
  category: string;
  email: boolean;
  /** ALWAYS_ON transactional messages cannot be turned off. */
  locked?: boolean;
}

/** GET /account/email-preferences — the email column of the notification matrix. */
export const getEmailPreferences = () =>
  apiGet<EmailPreference[]>("/account/email-preferences");

/** PATCH /account/email-preferences — persist one category toggle. */
export const updateEmailPreference = (category: string, email: boolean) =>
  apiPost<EmailPreference>("/account/email-preferences", { category, email });

/* ── Demo/live helper ──────────────────────────────────────────────────── */

/**
 * Run `real()` in live mode, or resolve to `demo` after a short simulated
 * delay in demo mode — keeps the ~8 email/GDPR flows from copy-pasting the
 * `if (demoMode) …` branch. The delay makes simulated success feel real.
 */
export function simulateOr<T>(
  demoMode: boolean,
  demo: T,
  real: () => Promise<T>,
  delayMs = 900,
): Promise<T> {
  if (!demoMode) return real();
  return new Promise((resolve) => setTimeout(() => resolve(demo), delayMs));
}
