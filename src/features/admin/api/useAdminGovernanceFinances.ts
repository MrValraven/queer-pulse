import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MemberRefDTO } from "../../../shared/api/refs";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  getAdminFinances,
  updateAdminFinances,
  type AdminFinanceHistoryPoint,
  type AdminFinanceLatest,
  type AdminFinanceResponseDTO,
  type AdminFinLine,
  type UpdateAdminFinancesBody,
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
  const toDemoLine = (ledgerRow: {
    demoLabel: string;
    amount: number;
    width: number;
  }): AdminFinLine => ({
    label: ledgerRow.demoLabel,
    amount: String(ledgerRow.amount),
    note: "",
    width: ledgerRow.width,
    items: [],
    total: { label: "", amount: String(ledgerRow.amount) },
    source: "seeded",
    enabled: true,
  });

  const latest: AdminFinanceLatest = {
    quarter: lastQuarter.label,
    incomeTotal: Math.round(lastQuarter.income * 1000),
    expenseTotal: Math.round(lastQuarter.spend * 1000),
    surplus: Math.round((lastQuarter.income - lastQuarter.spend) * 1000),
    mrr: 23150,
    sustainerCount: 1842,
    solidarityRate: 18,
    income: INCOME_LEDGER.map(toDemoLine),
    expense: LEDGER.map(toDemoLine),
    publishedAt: "",
    // Every demo figure starts as an unverified placeholder, so the tab
    // demonstrates the provenance badges out of the box; editing flips a
    // figure to `manual` (see `applyFinanceEdits`).
    sources: {
      mrr: "seeded",
      sustainerCount: "seeded",
      solidarityRate: "seeded",
      incomeTotal: "seeded",
      expenseTotal: "seeded",
      surplus: "computed",
    },
    editor: null,
    editedAt: null,
  };

  return { latest, history };
}

/** Query key for the Finances tab. Shared by the read query and the mutation's
 *  cache write so a demo edit persists for the session (demo never refetches). */
const financesQueryKey = (demoMode: boolean) =>
  ["admin-governance-finances", demoMode] as const;

/** The demo "editor" stamped on a demo-mode edit — demo has no real session
 *  identity, so the badge simply reads "edited by You". */
const DEMO_EDITOR: MemberRefDTO = {
  slug: "you",
  firstName: "You",
  lastName: "",
  avatarUrl: null,
};

const SCALAR_KEYS = [
  "mrr",
  "sustainerCount",
  "solidarityRate",
  "incomeTotal",
  "expenseTotal",
] as const;

function applyLedgerEdits(
  lines: AdminFinLine[],
  edits: UpdateAdminFinancesBody["income"],
): AdminFinLine[] {
  if (!edits || edits.length === 0) return lines;
  return lines.map((line, index) => {
    const edit = edits.find((candidate) => candidate.index === index);
    if (!edit) return line;
    const next: AdminFinLine = { ...line };
    if (edit.amount !== undefined && edit.amount !== line.amount) {
      next.amount = edit.amount;
      next.source = "manual";
    }
    if (edit.note !== undefined) next.note = edit.note;
    if (edit.enabled !== undefined) next.enabled = edit.enabled;
    return next;
  });
}

/**
 * Applies an edit body to a cached response — the demo mode's source of truth
 * (live mode replaces the whole payload from the server). Flips each changed
 * scalar's provenance to `manual`, recomputes `surplus` when a total moves, and
 * stamps the editor.
 */
export function applyFinanceEdits(
  current: AdminFinanceResponseDTO,
  body: UpdateAdminFinancesBody,
  editor: MemberRefDTO,
  editedAt: string,
): AdminFinanceResponseDTO {
  const latest = current.latest;
  if (!latest) return current;

  const next: AdminFinanceLatest = {
    ...latest,
    sources: { ...latest.sources },
  };
  let touched = false;

  for (const key of SCALAR_KEYS) {
    const value = body[key];
    if (value !== undefined && value !== latest[key]) {
      next[key] = value;
      next.sources[key] = "manual";
      touched = true;
    }
  }

  if (body.income) {
    next.income = applyLedgerEdits(latest.income, body.income);
    touched = true;
  }
  if (body.expense) {
    next.expense = applyLedgerEdits(latest.expense, body.expense);
    touched = true;
  }
  if (body.incomeTotal !== undefined || body.expenseTotal !== undefined) {
    next.surplus = next.incomeTotal - next.expenseTotal;
  }

  if (touched) {
    next.editor = editor;
    next.editedAt = editedAt;
  }
  return { ...current, latest: next };
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
 * network. Live mode calls `GET /admin/governance/finances` once and returns
 * the latest published quarterly figures plus quarter-over-quarter history.
 */
export function useAdminGovernanceFinances(): AdminGovernanceFinancesResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<AdminFinanceResponseDTO>({
    queryKey: financesQueryKey(demoMode),
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

/**
 * Corrects the editable figures on the latest governance finance report.
 *
 * Live mode PATCHes `/admin/governance/finances` and reconciles from the
 * server's response. Demo mode applies the edit to the cached payload via
 * {@link applyFinanceEdits} and keeps it there for the session — demo never
 * refetches, so the correction persists without a network round-trip.
 */
export function useUpdateAdminFinances() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = financesQueryKey(demoMode);

  return useDemoAwareMutation<
    AdminFinanceResponseDTO,
    Error,
    UpdateAdminFinancesBody
  >({
    demoMode,
    demoResult: (body) => {
      const current = queryClient.getQueryData<AdminFinanceResponseDTO>(
        queryKey,
      ) ?? { latest: null, history: [] };
      return applyFinanceEdits(
        current,
        body,
        DEMO_EDITOR,
        new Date().toISOString(),
      );
    },
    live: (body) => updateAdminFinances(body),
    logLabel: "admin.governance.finances.update",
    logContext: (body) => ({ fields: Object.keys(body) }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
