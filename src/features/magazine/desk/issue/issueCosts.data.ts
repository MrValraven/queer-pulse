import type { IssueCostsDto } from "../../api/issueCosts.api";

/**
 * Demo-mode fixture for `useIssueCosts` — one issue's money, already totalled
 * the way the backend returns it (CON-18). Two unpriced rows on purpose: the
 * card has to show the desk that a total can be incomplete.
 */
export const DEMO_ISSUE_COSTS: IssueCostsDto = {
  number: "14",
  title: "On rest.",
  pieceCount: 11,
  paymentCount: 9,
  unpricedCount: 2,
  totals: [
    {
      currency: "EUR",
      paymentCount: 7,
      fees: "2860.00",
      expenses: "184.50",
      total: "3044.50",
      paid: "1240.00",
      outstanding: "1804.50",
    },
  ],
};
