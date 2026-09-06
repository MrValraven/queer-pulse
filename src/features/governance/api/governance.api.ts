import { ApiError, apiGet, apiPost } from "../../../shared/api/client";
import { routes } from "../../../app/routeMap";
import type { FinLine } from "../governance.data";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `governance` domain returns (GET /governance/finances).
// Read-only + seeded — the rest of the Governance page (moderation steps,
// advisory council, principles, decision log) is fixed transparency prose with
// no backend of its own; this is the one section built from structured figures.

export interface FinanceStatDTO {
  n: string;
  l: string;
  trend: string;
  up: boolean;
}

export interface FinanceEventNoteDTO {
  title: string;
  body: string;
}

/** Operational-reserve progress figures ("€4,380 of €12,450 target"). Raw
 *  numbers — formatted on the frontend with `useFormat().currency()`. */
export interface FinanceReserveDTO {
  current: number;
  target: number;
}

/** A disclosed restricted-grant partner. `name`/`amount` are data; `scopeKey`
 *  is an i18n key for the restriction description. */
export interface FinancePartnerDTO {
  name: string;
  amount: number;
  scopeKey: string;
}

export interface GovernanceFinanceResponseDTO {
  quarter: string;
  stats: FinanceStatDTO[];
  income: FinLine[];
  expense: FinLine[];
  eventNotes: FinanceEventNoteDTO[];
  reserve: FinanceReserveDTO | null;
  partners: FinancePartnerDTO[];
  /** Structured quarter totals in euros. The frontend derives the income /
   *  expenditure column totals from these fields (formatted with
   *  `useFormat().currency()`), never from matching a stat tile's display
   *  label — so localisation or reworded live figures can't break them. */
  incomeTotal?: number | null;
  expenseTotal?: number | null;
  publishedAt: string;
}

export const getGovernanceFinances = (quarter?: string) => {
  const qs = quarter ? `?quarter=${encodeURIComponent(quarter)}` : "";
  return apiGet<GovernanceFinanceResponseDTO>(`/governance/finances${qs}`);
};

// ── Overview DTOs ────────────────────────────────────────────────────────────
// `GET /governance/overview` — the non-financial page structure (health
// snapshot, moderation steps, advisory council, principles, decision log).
// Structure-only: every `*Key`/`key` is a SHORT i18n key (no namespace/section
// prefix — the frontend prepends it), so translated prose stays in the i18n
// catalogs. `n`/`trendCount`, council `name`/`initials`, `icon`, `tint` are
// non-translatable data.

export interface HealthStatDTO {
  key: string;
  n: string;
  up: boolean;
  trendKey: string;
  trendCount?: number;
}

export interface ModerationStepDTO {
  key: string;
}

/**
 * PRD-265. The EN/PT an editor typed for an entry that has no i18n key,
 * because it was authored after the bundle shipped. Mirrors the backend's
 * `OverviewAuthoredText`.
 */
export interface AuthoredTextDTO {
  en: string;
  pt: string;
}

/**
 * A council seat. The role descriptor arrives as EXACTLY ONE of `roleKey` (a
 * seeded i18n key) or `role` (the editor's own words) — see PRD-265; the
 * backend enforces the exclusive-or, and `useGovernanceOverview` collapses the
 * two into one `GovernanceText` so no component has to know which it got.
 */
export interface CouncilSeatDTO {
  name: string;
  initials: string;
  roleKey?: string;
  role?: AuthoredTextDTO;
  tint: "jade" | "violet" | "plum";
}

/** A principle: `key` (seeded) or `title` + `text` (authored). */
export interface PrincipleDTO {
  key?: string;
  title?: AuthoredTextDTO;
  text?: AuthoredTextDTO;
  icon: string;
}

/** A decision-log entry: `key` (seeded) or `lead` + `body` (authored). */
export interface DecisionDTO {
  key?: string;
  lead?: AuthoredTextDTO;
  body?: AuthoredTextDTO;
}

export interface GovernanceOverviewResponseDTO {
  health: HealthStatDTO[];
  moderationSteps: ModerationStepDTO[];
  council: CouncilSeatDTO[];
  principles: PrincipleDTO[];
  decisions: DecisionDTO[];
  /** ISO-8601 timestamp of the last publish (P3-7), or `null` if never
   *  published. Advanced by the admin `POST /admin/governance/publish`. */
  publishedAt: string | null;
}

export const getGovernanceOverview = () =>
  apiGet<GovernanceOverviewResponseDTO>("/governance/overview");

// ── Admin publish (P3-7) ─────────────────────────────────────────────────────
// `POST /admin/governance/publish` — mark the current governance snapshot as
// published *now* so the public overview can surface a "last published" line.
// Moderator/admin only (server-guarded); the FE gates the button behind the
// admin route.

export interface GovernancePublishResponseDTO {
  publishedAt: string;
}

export const publishGovernanceOverview = () =>
  apiPost<GovernancePublishResponseDTO>("/admin/governance/publish");

// ── Raise a concern ──────────────────────────────────────────────────────────
// The public "Submit a concern" form (governance/GovernanceSections · RaiseSection)
// persists through the generic intake pipeline as the `governance_concern` kind:
// `POST /intakes/governance_concern`, public + optional-auth (a signed-in member
// is attributed by the backend's OptionalJwtAuthGuard). Staff triage the result
// on /admin/concerns. `email` is collected ONLY from logged-out submitters — a
// signed-in member is identified by their account, so the form omits it for them.

/** The concern categories the form offers (stable keys, not display labels — the
 *  admin dashboard localises them). */
export type ConcernCategory =
  "member" | "gathering" | "content" | "appeal" | "other";

export interface ConcernSubmission {
  category: ConcernCategory;
  description: string;
}

/**
 * Minimal ack the intake endpoint echoes — never the submitted payload.
 *
 * `statusToken` is the whole of PRD-261: the reference code, handed over at
 * the one moment it exists. The backend stores only its sha256 hash and
 * QueerPulse sends no email, so this response is the entire delivery
 * mechanism. Optional on the type because the same endpoint backs twelve
 * intake kinds and only a concern mints one.
 */
export interface ConcernAckDTO {
  id: string;
  status: string;
  statusToken?: string;
  /** ISO 8601 — when the concern was recorded. */
  submittedAt: string;
}

export const submitConcern = (submission: ConcernSubmission) =>
  apiPost<ConcernAckDTO>("/intakes/governance_concern", {
    payload: submission,
  });

// ── Checking back on a concern (PRD-261) ─────────────────────────────────────
// `GET /intakes/concerns/status?token=…`, public and unauthenticated: the
// person this answers usually has no account, which is the point of an
// anonymous reporting form. The code is the entire credential, throttled at 20
// requests/hour per IP, and every failure is one indistinguishable 404 so the
// route can never confirm whether a given code — or a given report — exists.

/** Where one concern stands. Deliberately three fields: this is the blast
 *  radius of a leaked code, so it carries no id, no category, no description
 *  and nothing staff wrote. */
export interface ConcernStatusDTO {
  /** `new` (nobody has picked it up yet), `reviewing`, `resolved`, or
   *  `dismissed` (closed without action). */
  status: string;
  /** ISO 8601 — when it was submitted. */
  submittedAt: string;
  /** ISO 8601 — when staff last moved it; null while still untouched. */
  updatedAt: string | null;
}

/**
 * The shape the backend's query DTO accepts: base64url, 32–128 characters.
 * Guarding on it client-side turns an obvious typo into an instant answer
 * instead of spending one of the endpoint's 20 requests/hour on a certain 400.
 */
export const CONCERN_STATUS_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

/** True when `token` could plausibly be a reference code at all. */
export function isWellFormedConcernToken(token: string): boolean {
  return CONCERN_STATUS_TOKEN_PATTERN.test(token);
}

export const getConcernStatus = (token: string) =>
  apiGet<ConcernStatusDTO>(
    `/intakes/concerns/status?token=${encodeURIComponent(token)}`,
  );

/**
 * True when the lookup can never succeed for this code, however the backend
 * phrased it: a 404 (the single indistinguishable miss) or a 400 (a code the
 * query DTO refused outright). Both get ONE message on screen, so someone
 * probing codes learns nothing from the difference — and retrying is pointless,
 * which is the rule the query hook's `retry` needs.
 *
 * Mirrors `isUnresolvableStatusToken` in `features/auth/api/joinRequest.api`,
 * the platform's other public token lookup.
 */
export function isUnresolvableConcernToken(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 400)
  );
}

/** The status page with the code already in the query string, so the common
 *  path from the confirmation panel is a click rather than a copy-and-paste. */
export const concernStatusLink = (token: string): string =>
  `${routes.concernStatus}?token=${encodeURIComponent(token)}`;
