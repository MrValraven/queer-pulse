import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminFinances,
  type AdminFinanceHistoryPoint,
  type AdminFinanceLatest,
  type AdminFinanceResponseDTO,
} from "./adminGovernanceFinances.api";

// Demo mode reshapes the admin page's own `adminGovernance.data` mock into
// the backend response shape so demo and live render through the same
// component. The mock is imported on demand inside the demo queryFn (see
// below) so it never ships in the live bundle. Ledger rows carry a
// `demoLabel` (plain-English text) used as the final `FinLine.label` — the
// mock has no per-row notes or line-item breakdown, so those fields are left
// empty, and the fictional MRR/sustainer/solidarity headline figures are
// hardcoded below.
async function buildDemoAdminFinances(): Promise<AdminFinanceResponseDTO> {
  const { QUARTERS, INCOME_LEDGER, LEDGER } = await import(
    "../adminGovernance.mock"
  );

  const history: AdminFinanceHistoryPoint[] = QUARTERS.map((quarterPoint) => ({
    quarter: quarterPoint.label,
    incomeTotal: Math.round(quarterPoint.income * 1000),
    expenseTotal: Math.round(quarterPoint.spend * 1000),
    surplus: Math.round((quarterPoint.income - quarterPoint.spend) * 1000),
  }));

  const lastQuarter = QUARTERS[QUARTERS.length - 1];
  if (!lastQuarter) {
    return { latest: null, history };
  }
  const latest: AdminFinanceLatest = {
    quarter: lastQuarter.label,
    incomeTotal: Math.round(lastQuarter.income * 1000),
    expenseTotal: Math.round(lastQuarter.spend * 1000),
    surplus: Math.round((lastQuarter.income - lastQuarter.spend) * 1000),
    mrr: 23150,
    sustainerCount: 1842,
    solidarityRate: 18,
    income: INCOME_LEDGER.map((ledgerRow) => ({
      label: ledgerRow.demoLabel,
      amount: String(ledgerRow.amount),
      note: "",
      width: ledgerRow.width,
      items: [],
      total: { label: "", amount: String(ledgerRow.amount) },
    })),
    expense: LEDGER.map((ledgerRow) => ({
      label: ledgerRow.demoLabel,
      amount: String(ledgerRow.amount),
      note: "",
      width: ledgerRow.width,
      items: [],
      total: { label: "", amount: String(ledgerRow.amount) },
    })),
    publishedAt: "",
  };

  return { latest, history };
}

export interface AdminGovernanceFinancesResult {
  latest: AdminFinanceLatest | null;
  history: AdminFinanceHistoryPoint[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

const EMPTY: AdminGovernanceFinancesResult = {
  latest: null,
  history: [],
  loading: false,
};

/**
 * Data source for the admin governance Finances tab.
 *
 * Demo mode reshapes `adminGovernance.data`'s `QUARTERS`/`INCOME_LEDGER`/
 * `LEDGER` mocks into the backend response shape — same demo experience, no
 * network. Live mode calls `GET /governance/admin/finances` once and returns
 * the latest published quarterly figures plus quarter-over-quarter history.
 */
export function useAdminGovernanceFinances(): AdminGovernanceFinancesResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<AdminFinanceResponseDTO>({
    queryKey: ["admin-governance-finances", demoMode],
    queryFn: async () =>
      demoMode ? buildDemoAdminFinances() : getAdminFinances(),
  });

  if (!query.data) {
    return { ...EMPTY, loading: query.isPending };
  }

  return {
    latest: query.data.latest,
    history: query.data.history,
    loading: false,
  };
}
