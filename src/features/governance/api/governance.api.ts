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

export interface GovernanceFinanceResponseDTO {
  quarter: string;
  stats: FinanceStatDTO[];
  income: FinLine[];
  expense: FinLine[];
  eventNotes: FinanceEventNoteDTO[];
  publishedAt: string;
}

export const getGovernanceFinances = (quarter?: string) => {
  const qs = quarter ? `?quarter=${encodeURIComponent(quarter)}` : "";
  return apiGet<GovernanceFinanceResponseDTO>(`/governance/finances${qs}`);
};
