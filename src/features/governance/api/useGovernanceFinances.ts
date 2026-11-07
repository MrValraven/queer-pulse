import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getGovernanceFinances,
  type FinanceEventNoteDTO,
  type FinancePartnerDTO,
  type FinanceProvenanceDTO,
  type FinanceReserveDTO,
  type FinanceStatDTO,
  type GovernanceFinanceResponseDTO,
} from "./governance.api";
import type { FinLine } from "../governance.data";

export interface GovernanceFinancesResult {
  /** The published quarter ("2026-Q3"), or null when no report has been
   *  published yet. Drives the section's period label. */
  quarter: string | null;
  /** True once a report is published. False on the live empty report, where
   *  the section renders its "nothing published yet" line (PRD-447). */
  isPublished: boolean;
  /** Who entered the figures and when, for the section's provenance line. */
  provenance: FinanceProvenanceDTO | null;
  stats: FinanceStatDTO[];
  income: FinLine[];
  expense: FinLine[];
  eventNotes: FinanceEventNoteDTO[];
  reserve: FinanceReserveDTO | null;
  partners: FinancePartnerDTO[];
  /** Structured quarter totals (euros) — the stable source for the income /
   *  expenditure column totals. Matched by DTO field, never by the display
   *  label of a stat tile, so localisation or a reworded live report can't
   *  break the totals. Null when the report omits them. */
  incomeTotal: number | null;
  expenseTotal: number | null;
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the live fetch failed — the section renders a retry state
   *  instead of a silently-empty figures grid. Always false in demo. */
  error: boolean;
  /** Refetch the finances after an error (wired to the retry affordance). */
  retry: () => void;
}

// Demo mode serves the same empty report a live backend serves before the
// governance team publishes a quarter. The sandbox carries no invented
// income, expenditure, reserve or partner figures, so the page shows its
// "nothing published yet" line there too (like the decision log in
// `useGovernanceOverview`).
const DEMO_EMPTY_REPORT: GovernanceFinanceResponseDTO = {
  quarter: null,
  stats: [],
  income: [],
  expense: [],
  eventNotes: [],
  reserve: null,
  partners: [],
  incomeTotal: null,
  expenseTotal: null,
  publishedAt: null,
  provenance: null,
};

const EMPTY: Omit<GovernanceFinancesResult, "loading" | "error" | "retry"> = {
  quarter: null,
  isPublished: false,
  provenance: null,
  stats: [],
  income: [],
  expense: [],
  eventNotes: [],
  reserve: null,
  partners: [],
  incomeTotal: null,
  expenseTotal: null,
};

/**
 * Data source for `FinancesSection`'s quarterly figures.
 *
 * Demo mode returns the empty report (`DEMO_EMPTY_REPORT`), so the section
 * shows its "nothing published yet" line and no invented figure; no network.
 *
 * Live mode calls `GET /governance/finances` once (mirrors
 * `useMyEventsData`'s demo/live split) and returns the latest published
 * quarterly transparency snapshot, or `isPublished: false` while the backend
 * answers with its empty report.
 */
export function useGovernanceFinances(): GovernanceFinancesResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<GovernanceFinanceResponseDTO>({
    queryKey: ["governance-finances", demoMode],
    queryFn: async () =>
      demoMode ? DEMO_EMPTY_REPORT : getGovernanceFinances(),
  });

  const retry = () => {
    void query.refetch();
  };

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending, error: query.isError, retry };
  }

  return {
    quarter: query.data.quarter,
    // Published needs a quarter AND a provenance a person stands behind. An
    // older backend sends the seeded report with no provenance at all, so a
    // frontend that ships first still shows "nothing published yet".
    isPublished:
      query.data.quarter !== null &&
      query.data.provenance != null &&
      query.data.provenance.source !== "seeded",
    provenance: query.data.provenance ?? null,
    stats: query.data.stats,
    income: query.data.income,
    expense: query.data.expense,
    eventNotes: query.data.eventNotes,
    reserve: query.data.reserve,
    partners: query.data.partners,
    incomeTotal: query.data.incomeTotal ?? null,
    expenseTotal: query.data.expenseTotal ?? null,
    loading: false,
    error: false,
    retry,
  };
}
