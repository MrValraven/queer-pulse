import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getGovernanceFinances,
  type FinanceEventNoteDTO,
  type FinancePartnerDTO,
  type FinanceReserveDTO,
  type FinanceStatDTO,
  type GovernanceFinanceResponseDTO,
} from "./governance.api";
import type { FinLine } from "../governance.data";

export interface GovernanceFinancesResult {
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

// Demo mode reshapes the page's own mocks into the backend response shape so
// demo and live render through the same component. The `governance.data` mock
// is imported on demand inside the demo queryFn (see below) so it never ships
// in the live bundle. In particular the `EVENTS` mock is a `[title, body][]`
// tuple array (a JSX shorthand for `<strong>{title}</strong> {body}`), reshaped
// to the backend's named `{title,body}` response shape.
async function buildDemoFinances(): Promise<GovernanceFinanceResponseDTO> {
  const {
    EVENTS,
    EXPENSE,
    FINANCE_PARTNERS,
    FIN_STATS,
    INCOME,
    RESERVE_CURRENT,
    RESERVE_TARGET,
  } = await import("../governance.data");
  return {
    quarter: "",
    stats: FIN_STATS,
    income: INCOME,
    expense: EXPENSE,
    eventNotes: EVENTS.map(([title, body]) => ({ title, body })),
    reserve: { current: RESERVE_CURRENT, target: RESERVE_TARGET },
    partners: FINANCE_PARTNERS,
    // Structured totals mirror the demo `FIN_STATS` "total income"/"total
    // expenditure" tiles (€4,620 / €4,150) so demo and live derive the column
    // totals from the same DTO field, not a hardcoded label match.
    incomeTotal: 4620,
    expenseTotal: 4150,
    publishedAt: "",
  };
}

const EMPTY: Omit<GovernanceFinancesResult, "loading" | "error" | "retry"> = {
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
 * Demo mode returns the page's own `FIN_STATS`/`INCOME`/`EXPENSE`/`EVENTS`
 * mocks unchanged — byte-for-byte the same demo experience, no network.
 *
 * Live mode calls `GET /governance/finances` once (mirrors
 * `useMyEventsData`'s demo/live split) and returns the latest published
 * quarterly transparency snapshot.
 */
export function useGovernanceFinances(): GovernanceFinancesResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<GovernanceFinanceResponseDTO>({
    queryKey: ["governance-finances", demoMode],
    queryFn: async () =>
      demoMode ? buildDemoFinances() : getGovernanceFinances(),
  });

  const retry = () => {
    void query.refetch();
  };

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending, error: query.isError, retry };
  }

  return {
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
