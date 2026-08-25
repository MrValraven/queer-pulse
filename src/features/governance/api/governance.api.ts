import { apiGet, apiPost } from "../../../shared/api/client";
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

export interface CouncilSeatDTO {
  name: string;
  initials: string;
  roleKey: string;
  tint: "jade" | "violet" | "plum";
}

export interface PrincipleDTO {
  key: string;
  icon: string;
}

export interface DecisionDTO {
  key: string;
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
  /** Only sent by logged-out submitters, so staff can follow up. */
  email?: string;
}

/** Minimal ack the intake endpoint echoes — never the submitted payload. */
export interface ConcernAckDTO {
  id: string;
  status: string;
}

export const submitConcern = (submission: ConcernSubmission) =>
  apiPost<ConcernAckDTO>("/intakes/governance_concern", {
    payload: submission,
  });
