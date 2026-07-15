import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getGovernanceFinances,
  type FinanceEventNoteDTO,
  type FinanceStatDTO,
  type GovernanceFinanceResponseDTO,
} from "./governance.api";
import {
  EVENTS,
  EXPENSE,
  FIN_STATS,
  INCOME,
  type FinLine,
} from "../governance.data";

export interface GovernanceFinancesResult {
  stats: FinanceStatDTO[];
  income: FinLine[];
  expense: FinLine[];
  eventNotes: FinanceEventNoteDTO[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

// The frontend's `EVENTS` mock is a `[title, body][]` tuple array (a JSX
// shorthand for `<strong>{title}</strong> {body}`) — reshaped here to match
// the backend's named `{title,body}` response shape, so demo and live render
// through the same component.
const DEMO_EVENT_NOTES: FinanceEventNoteDTO[] = EVENTS.map(([title, body]) => ({
  title,
  body,
}));

const EMPTY: GovernanceFinancesResult = {
  stats: [],
  income: [],
  expense: [],
  eventNotes: [],
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
    enabled: !demoMode,
    queryFn: () => getGovernanceFinances(),
  });

  if (demoMode) {
    return {
      stats: FIN_STATS,
      income: INCOME,
      expense: EXPENSE,
      eventNotes: DEMO_EVENT_NOTES,
      loading: false,
    };
  }

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending };
  }

  return {
    stats: query.data.stats,
    income: query.data.income,
    expense: query.data.expense,
    eventNotes: query.data.eventNotes,
    loading: false,
  };
}
