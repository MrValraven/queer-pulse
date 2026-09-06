import {
  apiDelete,
  apiGet,
  apiPost,
  postUnversioned,
  refreshSession,
} from "../../../shared/api/client";

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
 * ⚠️ NONE OF THIS IS BUILT, AND IT IS NOT PLANNED. QueerPulse delivers no email
 * and never will: there is no mail service in the backend, no provider, no
 * dependency, no sender. A nodemailer-backed one was added and removed again on
 * 2026-08-26; see `queerpulse-backend/docs/ops/no-mailer-at-launch.md`. This
 * block is kept only as the DESIGN sketch for spec 11, because the trigger
 * endpoints below are real. Do not write UI copy that promises any of these
 * arrive: the export and deletion screens each shipped such a promise and both
 * had to be rewritten. All would be TRANSACTIONAL (no unsubscribe) unless
 * noted.
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
 * Idempotency, were any of it ever built: every send would carry a
 * deterministic `messageKey` server-side so a "Resend" re-delivers the SAME
 * keyed message rather than spamming.
 * ──────────────────────────────────────────────────────────────────────── */

/* ── Step-up re-authentication ─────────────────────────────────────────── */
//
// There is no `POST /account/reauth` anymore, and no `reauth()` call here.
// Auth is Google OAuth + invite redemption (no password), so a plain POST
// with no credential attached had nothing to actually verify — it minted a
// token from nothing but the caller's own claim. The `reauthToken` every
// erasure/export route below still requires is now minted only by completing
// a REAL Google OAuth round trip (`prompt=login`) as the same already-signed-in
// member — see `beginReauth`/`getCachedReauthToken` in `useReauthToken.ts`.

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
   * Required. An Art. 20 export dumps everything we hold on a person, so the
   * backend gates it with the same step-up token as deletion/deactivation.
   * `useExportFlow.start()` mints it on the live path — callers never pass it.
   *
   * This token is the ONLY identity gate on the route. The UI used to claim an
   * emailed verification link gated it; that flow never existed and the copy
   * has since been corrected to describe the in-app step-up.
   */
  reauthToken: string;
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

/**
 * POST /account/dsar — record a data-subject request. The backend derives the
 * subject from the authenticated cookie session (never a body email), mints the
 * reference and computes the statutory 30-day due date, and returns the created
 * `DsarRequest`. Gated by the same step-up token as the erasure/export routes.
 */
export const submitDsar = (dto: SubmitDsarDto) =>
  apiPost<DsarRequest>("/account/dsar", dto);

/**
 * GET /account/dsar — the caller's own DSAR history, newest first. Scoped
 * server-side to the authenticated cookie session (never a body email), so the
 * frontend never fabricates a member's request history. An empty array means
 * the member has filed nothing yet.
 */
export const listDsar = () => apiGet<DsarRequest[]>("/account/dsar");

/* ── Sessions (spec 08 territory — referenced here for the security email) ── */

/**
 * One live session, verbatim from `GET /account/sessions`.
 *
 * Verified against the backend rather than guessed: `account.controller.ts`
 * `listSessions` → `AccountService.listSessions` → `toSessionResponse`
 * (`account-response.ts`). A "session" is one DEVICE: a family of refresh-token
 * rows descended from a single sign-in, newest first. That store has no geo/IP
 * and no IP column, so this shape carries NO location — the page must not
 * invent one. `deviceLabel` IS filled now (a coarse "Chrome on macOS", stored
 * at sign-in since `AddSecurityAlertsAndDeviceLabel1794610100000`), and comes
 * back `null` only for sessions that started before that column existed.
 * `current` is resolved server-side from the presenting `refresh_token` cookie.
 */
export interface SessionResponse {
  /**
   * The session's stable id (a refresh-token family). Safe to hold across a
   * rotation, which is what `revokeSession` below relies on: the page can sit
   * open for an hour and its Sign out buttons still address the right devices.
   */
  id: string;
  /**
   * A coarse device name — "Chrome on macOS", "Safari on iPhone" — stored at
   * sign-in. `null` for sessions that predate the column, which is why the page
   * still falls back to parsing `userAgent` (see `sessions.adapters.ts`).
   */
  deviceLabel: string | null;
  /** Raw UA string captured at sign-in; `""` when the client sent none. */
  userAgent: string;
  /** True for the session making this request (matched on the refresh cookie). */
  current: boolean;
  /** When this device SIGNED IN, unchanged by the rotations since. */
  createdAt: string;
  /**
   * The last time this device rotated a token. The nearest thing the store has
   * to "last seen", and coarse by nature: a tab refreshes on its own schedule,
   * so this trails real activity by up to one access-token lifetime. Shown as
   * an approximate "last activity", never as an audit trail.
   */
  lastUsedAt: string;
  expiresAt: string;
}

/** GET /account/sessions — every live session for the caller, newest first. */
export const getSessions = () => apiGet<SessionResponse[]>("/account/sessions");

/**
 * DELETE /account/sessions/:id — revoke one session.
 *
 * The security signal that pairs with this is the in-app `security_new_sign_in`
 * notification (plus push), raised when a device the member has not used before
 * signs in. There is no email in this flow, or in any other: QueerPulse
 * delivers none, so the UI must never claim one is on the way.
 */
export const revokeSession = (id: string) =>
  apiDelete<void>(`/account/sessions/${id}`);

/** DELETE /account/sessions — revoke every session except the current one. */
export const revokeOtherSessions = () => apiDelete<void>("/account/sessions");

/**
 * POST /auth/logout-all — end EVERY session, this device included, and clear
 * this browser's auth and CSRF cookies.
 *
 * The other half of "sign out everywhere". `revokeOtherSessions` above keeps
 * the caller signed in here, which is right when a member is tidying up old
 * devices and wrong when they think their account is compromised: that member
 * had to run this page's bulk control AND then find the sign-out item in the
 * account menu, and knowing to do both was left to them (PRD-308).
 *
 * UNVERSIONED, like `postLogout`: the controller is `@Version(VERSION_NEUTRAL)`
 * so the path stays inside the `path=/auth` scope of the refresh cookie.
 *
 * Unlike `logout` the backend route is authenticated, because it acts on every
 * session an account holds and the id has to come from a verified access token
 * rather than a presented cookie. `postUnversioned` does no 401 refresh of its
 * own, so a member whose access token has just expired gets one retry behind
 * `refreshSession()`. Resolves false if it still did not land, and the caller
 * must keep the member signed in rather than claim a sign-out that never
 * happened.
 */
export async function postLogoutAll(): Promise<boolean> {
  if (await postUnversioned("/auth/logout-all")) return true;
  if (!(await refreshSession())) return false;
  return postUnversioned("/auth/logout-all");
}

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
