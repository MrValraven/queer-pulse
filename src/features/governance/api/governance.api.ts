import { apiGet } from "../../../shared/api/client";
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
}

export const getGovernanceOverview = () =>
  apiGet<GovernanceOverviewResponseDTO>("/governance/overview");
