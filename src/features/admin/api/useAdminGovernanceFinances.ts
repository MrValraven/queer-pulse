import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MemberRefDTO } from "../../../shared/api/refs";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { financeAmountOrZero } from "../adminFinanceAmount";
import {
  getAdminFinances,
  openFinanceQuarter,
  updateAdminFinances,
  type AdminFinanceHistoryPoint,
  type AdminFinanceLatest,
  type AdminFinanceResponseDTO,
  type AdminFinLine,
  type FinanceLedgerEdit,
  type FinanceLineItem,
  type UpdateAdminFinancesBody,
} from "./adminGovernanceFinances.api";

/** A breakdown's total as the backend writes it: summed in whole cents, then
 *  written back as a canonical number string. */
function sumItemAmounts(items: FinanceLineItem[]): string {
  const cents = items.reduce(
    (total, item) => total + Math.round(financeAmountOrZero(item.amount) * 100),
    0,
  );
  return String(Math.round(cents) / 100);
}

// Demo mode reshapes the admin page's own `adminGovernance.data` mock into
// the backend response shape so demo and live render through the same
// component. The mock is imported on demand inside the demo queryFn (see
// below) so it never ships in the live bundle. Ledger rows carry a
// `demoLabel` (plain-English text) used as the final `FinLine.label`. The
// mock has no per-row notes, so those are left empty; a row with sample
// `items` carries them as a saved (`manual`) breakdown whose sum is the row's
// amount. The fictional MRR/sustainer/solidarity headline figures are
// hardcoded below.
async function buildDemoAdminFinances(): Promise<AdminFinanceResponseDTO> {
  const { QUARTERS, INCOME_LEDGER, LEDGER } =
    await import("../adminGovernance.mock");
  // The public page's demo report, so the "Edit public report" dialog opens
  // on the same tiles, notes and partners the demo Governance page shows.
  const {
    EVENTS,
    FINANCE_PARTNERS,
    FIN_STATS,
    RESERVE_CURRENT,
    RESERVE_TARGET,
  } = await import("../../governance/governance.data");

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
    items?: FinanceLineItem[];
  }): AdminFinLine => {
    const items = ledgerRow.items ?? [];
    const amount =
      items.length > 0 ? sumItemAmounts(items) : String(ledgerRow.amount);
    return {
      label: ledgerRow.demoLabel,
      amount,
      note: "",
      width: ledgerRow.width,
      items,
      total: { label: "", amount },
      source: "seeded",
      ...(items.length > 0 && { itemsSource: "manual" as const }),
      enabled: true,
    };
  };

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
    stats: FIN_STATS,
    eventNotes: EVENTS.map(([title, body]) => ({ title, body })),
    partners: FINANCE_PARTNERS,
    reserve: { current: RESERVE_CURRENT, target: RESERVE_TARGET },
    // Every headline figure starts unverified, so the demo report starts off
    // the public page, exactly as a freshly opened live quarter does.
    isPublic: false,
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

/** The amount an edit leaves a line with, as the backend decides it: a
 *  non-empty breakdown's sum wins over any `amount` sent beside it. */
function editedAmount(edit: FinanceLedgerEdit): string | undefined {
  return edit.items && edit.items.length > 0
    ? sumItemAmounts(edit.items)
    : edit.amount;
}

function applyLedgerEdits(
  lines: AdminFinLine[],
  edits: UpdateAdminFinancesBody["income"],
): AdminFinLine[] {
  if (!edits || edits.length === 0) return lines;
  const corrected = lines.map((line, index) => {
    const edit = edits.find((candidate) => candidate.index === index);
    if (!edit) return line;
    const next: AdminFinLine = { ...line };
    if (edit.label !== undefined) next.label = edit.label;
    const amount = editedAmount(edit);
    if (amount !== undefined && amount !== line.amount) {
      next.amount = amount;
      next.source = "manual";
    }
    // A saved breakdown replaces the old one whole; `[]` clears it and the
    // amount stays as set above. The total follows the amount either way,
    // as the backend writes it.
    if (edit.items !== undefined) {
      next.items = edit.items;
      next.itemsSource = "manual";
      next.total = { label: "", amount: next.amount };
    }
    if (edit.note !== undefined) next.note = edit.note;
    if (edit.enabled !== undefined) next.enabled = edit.enabled;
    return next;
  });
  // PRD-447: edits past the last row append new rows, as the backend does.
  const appended = edits
    .filter((edit) => edit.index >= lines.length)
    .sort((first, second) => first.index - second.index)
    .map((edit): AdminFinLine => {
      const amount = editedAmount(edit) ?? "0";
      const items = edit.items ?? [];
      return {
        label: edit.label ?? "",
        amount,
        note: edit.note ?? "",
        width: 0,
        items,
        total: { label: "", amount },
        source: "manual",
        ...(items.length > 0 && { itemsSource: "manual" as const }),
        enabled: edit.enabled ?? true,
      };
    });
  return [...corrected, ...appended];
}

/** Mirrors the backend's `isEnteredByPeople`: public once no headline figure
 *  is still unverified. */
function isEnteredByPeople(sources: AdminFinanceLatest["sources"]): boolean {
  return SCALAR_KEYS.every((key) => sources[key] !== "seeded");
}

/** Mirrors the backend's ledger `isFigureChanged`: an amount that moved
 *  (a breakdown whose sum moved included), or a row appended. A label, note
 *  or on/off switch is words. */
function hasLedgerFigureEdit(
  lines: AdminFinLine[],
  edits: UpdateAdminFinancesBody["income"],
): boolean {
  return (edits ?? []).some((edit) => {
    const amount = editedAmount(edit);
    return (
      edit.index >= lines.length ||
      (amount !== undefined && amount !== lines[edit.index]?.amount)
    );
  });
}

/**
 * Applies an edit body to a cached response — the demo mode's source of truth
 * (live mode replaces the whole payload from the server). Flips each changed
 * scalar's provenance to `manual`, recomputes `surplus` when a total moves, and
 * stamps the editor only when a figure moved, as the backend does: a save that
 * only touches words leaves the "figures entered on" date alone.
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
  let isFigureTouched =
    hasLedgerFigureEdit(latest.income, body.income) ||
    hasLedgerFigureEdit(latest.expense, body.expense);

  for (const key of SCALAR_KEYS) {
    const value = body[key];
    if (
      value !== undefined &&
      (value !== latest[key] || latest.sources[key] === "seeded")
    ) {
      next[key] = value;
      next.sources[key] = "manual";
      isFigureTouched = true;
    }
  }

  if (body.income) next.income = applyLedgerEdits(latest.income, body.income);
  if (body.expense) {
    next.expense = applyLedgerEdits(latest.expense, body.expense);
  }
  if (body.incomeTotal !== undefined || body.expenseTotal !== undefined) {
    next.surplus = (next.incomeTotal ?? 0) - (next.expenseTotal ?? 0);
  }
  if (body.stats) next.stats = body.stats;
  if (body.eventNotes) next.eventNotes = body.eventNotes;
  if (body.partners) next.partners = body.partners;
  if (body.reserve !== undefined) next.reserve = body.reserve;
  next.isPublic = isEnteredByPeople(next.sources);

  if (isFigureTouched) {
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
  /** True when the fetch failed, so the tab can tell an outage apart from a
   *  section that genuinely has no rows yet (DES-22). */
  isError: boolean;
  /** Re-runs the failed fetch; wire to the error state's retry. */
  refetch: () => void;
}

const EMPTY: Omit<AdminGovernanceFinancesResult, "isError" | "refetch"> = {
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
    return {
      ...EMPTY,
      loading: query.isPending,
      isError: query.isError,
      refetch: () => void query.refetch(),
    };
  }

  return {
    latest: query.data.latest,
    history: query.data.history,
    loading: false,
    isError: query.isError,
    refetch: () => void query.refetch(),
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

/** The empty report a newly opened quarter starts as, for demo mode. */
function openDemoQuarter(
  current: AdminFinanceResponseDTO,
  quarter: string,
): AdminFinanceResponseDTO {
  const latest: AdminFinanceLatest = {
    quarter,
    incomeTotal: null,
    expenseTotal: null,
    surplus: 0,
    mrr: null,
    sustainerCount: null,
    solidarityRate: null,
    income: [],
    expense: [],
    stats: [],
    eventNotes: [],
    partners: [],
    reserve: null,
    isPublic: false,
    publishedAt: new Date().toISOString(),
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
  // No history point yet: the chart plots a quarter once its totals are
  // entered, so an opened quarter never reads as a real €0.
  return { latest, history: current.history };
}

/**
 * PRD-447. Opens an empty report for the next quarter. Live mode POSTs to
 * `/admin/governance/finances/quarters`; demo mode adds the empty quarter to
 * the cached payload for the session.
 */
export function useOpenFinanceQuarter() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = financesQueryKey(demoMode);

  return useDemoAwareMutation<AdminFinanceResponseDTO, Error, string>({
    demoMode,
    demoResult: (quarter) =>
      openDemoQuarter(
        queryClient.getQueryData<AdminFinanceResponseDTO>(queryKey) ?? {
          latest: null,
          history: [],
        },
        quarter,
      ),
    live: (quarter) => openFinanceQuarter(quarter),
    logLabel: "admin.governance.finances.openQuarter",
    logContext: (quarter) => ({ quarter }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
