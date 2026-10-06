import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { FinLine } from "../../governance/governance.data";
import type {
  FinanceEventNoteDTO,
  FinancePartnerDTO,
  FinanceReserveDTO,
  FinanceStatDTO,
} from "../../governance/api/governance.api";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `governance` domain returns for the admin finances tab
// (GET /admin/governance/finances). Reuses the public `FinLine` shape
// (`governance/governance.data`) so income/expense lines stay consistent
// with the public transparency-report response.

/** Where a finance figure came from — drives the provenance badge. `seeded`
 *  means "from the quarterly seed, never verified"; `manual` means an admin
 *  typed it; `computed` means derived (surplus), never edited directly. */
export type FinanceMetricSource = "seeded" | "manual" | "computed";

/** A ledger row plus the provenance of its `amount`. */
export type AdminFinLine = FinLine & { source?: FinanceMetricSource };

/** Provenance of each editable scalar figure. */
export interface AdminFinanceSources {
  mrr: FinanceMetricSource;
  sustainerCount: FinanceMetricSource;
  solidarityRate: FinanceMetricSource;
  incomeTotal: FinanceMetricSource;
  expenseTotal: FinanceMetricSource;
  surplus: FinanceMetricSource;
}

export interface AdminFinanceHistoryPoint {
  quarter: string;
  incomeTotal: number;
  expenseTotal: number;
  surplus: number;
}

export interface AdminFinanceLatest {
  quarter: string;
  /** The five editable headline figures are null until someone enters them
   *  (a freshly opened quarter), so the editor shows an empty field. */
  incomeTotal: number | null;
  expenseTotal: number | null;
  surplus: number;
  mrr: number | null;
  sustainerCount: number | null;
  solidarityRate: number | null;
  income: AdminFinLine[];
  expense: AdminFinLine[];
  /** PRD-447. The public report's tiles, notes and disclosures. */
  stats: FinanceStatDTO[];
  eventNotes: FinanceEventNoteDTO[];
  partners: FinancePartnerDTO[];
  reserve: FinanceReserveDTO | null;
  /** PRD-447. Whether the public Governance page shows this report: true once
   *  none of the five headline figures is still unverified. */
  isPublic: boolean;
  publishedAt: string;
  sources: AdminFinanceSources;
  /** Who last edited any metric; null when nothing has been edited. */
  editor: MemberRefDTO | null;
  /** When any metric was last edited (ISO); null when never edited. */
  editedAt: string | null;
}

export interface AdminFinanceResponseDTO {
  latest: AdminFinanceLatest | null;
  history: AdminFinanceHistoryPoint[];
}

// ── Update payloads ─────────────────────────────────────────────────────────

/** One correction to a single income/expense ledger row, addressed by index.
 *  `enabled` toggles whether the row renders on the dashboard at all. An
 *  index one past the last row appends a new row (PRD-447), which then needs
 *  a `label` and an `amount`. */
export interface FinanceLedgerEdit {
  index: number;
  label?: string;
  amount?: string;
  note?: string;
  enabled?: boolean;
}

/** Partial update — only the fields present are written and audited. `surplus`
 *  is intentionally absent (always recomputed from the two totals). */
export interface UpdateAdminFinancesBody {
  mrr?: number;
  sustainerCount?: number;
  solidarityRate?: number;
  incomeTotal?: number;
  expenseTotal?: number;
  income?: FinanceLedgerEdit[];
  expense?: FinanceLedgerEdit[];
  /** PRD-447. Full replacements for the public report's tiles, notes and
   *  partners; `reserve: null` clears the reserve. */
  stats?: FinanceStatDTO[];
  eventNotes?: FinanceEventNoteDTO[];
  partners?: FinancePartnerEdit[];
  reserve?: FinanceReserveDTO | null;
  note?: string;
}

/** A partner as the editor sends it: always the admin's own `scope` words. */
export interface FinancePartnerEdit {
  name: string;
  amount: number;
  scope: string;
}

/** One audit-trail row: who changed which figure, from what, to what, and why. */
export interface AdminFinanceChangeDTO {
  id: string;
  actor: MemberRefDTO | null;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  note: string | null;
  createdAt: string;
}

export const getAdminFinances = () =>
  apiGet<AdminFinanceResponseDTO>("/admin/governance/finances");

export const updateAdminFinances = (body: UpdateAdminFinancesBody) =>
  apiPatch<AdminFinanceResponseDTO>("/admin/governance/finances", body);

/** PRD-447. Opens an empty report for the next quarter ("2026-Q3"). */
export const openFinanceQuarter = (quarter: string) =>
  apiPost<AdminFinanceResponseDTO>("/admin/governance/finances/quarters", {
    quarter,
  });

export const getAdminFinanceChanges = () =>
  apiGet<AdminFinanceChangeDTO[]>("/admin/governance/finances/changes");
