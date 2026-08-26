import { apiGet } from "../../../shared/api/client";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Mirrors `queerpulse-backend/src/magazine/magazine-issue-costs.service.ts`
// verbatim. Every money figure is a DECIMAL STRING off Postgres `numeric`,
// already summed server-side (CON-18) — never parse one into a `number`.

/** What one issue cost in a single currency. */
export interface IssueCostCurrencyTotalDto {
  /** ISO 4217, e.g. "EUR". */
  currency: string;
  /** Payment rows carrying at least one amount in this currency. */
  paymentCount: number;
  fees: string;
  expenses: string;
  /** `fees` + `expenses`. */
  total: string;
  paid: string;
  /** `total` - `paid`: what the desk still owes on this issue. */
  outstanding: string;
}

/** GET /magazine/admin/issues/:number/costs. */
export interface IssueCostsDto {
  number: string;
  title: string;
  /** Pieces assigned to this issue, priced or not. */
  pieceCount: number;
  /** Payment rows opened against those pieces. */
  paymentCount: number;
  /** Payment rows with no amount, and so outside every total below. */
  unpricedCount: number;
  /**
   * One entry per currency actually used. Empty when nothing on the issue is
   * priced yet. Currencies are never summed together: the backend holds no
   * exchange rates, and a single figure would be a guess.
   */
  totals: IssueCostCurrencyTotalDto[];
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export const getIssueCosts = (number: string) =>
  apiGet<IssueCostsDto>(
    `/magazine/admin/issues/${encodeURIComponent(number)}/costs`,
  );
