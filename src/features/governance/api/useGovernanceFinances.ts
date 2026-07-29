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
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
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
    publishedAt: "",
  };
}

const EMPTY: GovernanceFinancesResult = {
  stats: [],
  income: [],
  expense: [],
  eventNotes: [],
  reserve: null,
  partners: [],
  loading: false,
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

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending };
  }

  return {
    stats: query.data.stats,
    income: query.data.income,
    expense: query.data.expense,
    eventNotes: query.data.eventNotes,
    reserve: query.data.reserve,
    partners: query.data.partners,
    loading: false,
  };
}
