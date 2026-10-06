import { describe, expect, it } from "vitest";
import {
  buildReportBody,
  patchRow,
  toReportDrafts,
  type ScopeResolver,
} from "./adminGovernanceFinancesReport.utils";
import type { AdminFinanceLatest } from "./api/adminGovernanceFinances.api";

/**
 * RES-F9. A partner seeded with a translated `scopeKey` shows in the admin's
 * language, and saving the list must send the key back untouched for every
 * partner whose restriction the admin left alone. Only edited words replace
 * the key.
 */

const SCOPE_KEY = "governance:sections.finances.partnerScope.mentalHealthFund";
const resolveScope: ScopeResolver = (partner) =>
  partner.scope ?? (partner.scopeKey ? "o Fundo de Saúde Mental" : "");

const latest = (
  partners: AdminFinanceLatest["partners"],
): AdminFinanceLatest => ({
  quarter: "2026-Q3",
  incomeTotal: 1000,
  expenseTotal: 800,
  surplus: 200,
  mrr: 900,
  sustainerCount: 40,
  solidarityRate: 10,
  income: [],
  expense: [],
  stats: [],
  eventNotes: [],
  partners,
  reserve: null,
  isPublic: true,
  publishedAt: "2026-07-01T00:00:00.000Z",
  sources: {
    mrr: "manual",
    sustainerCount: "manual",
    solidarityRate: "manual",
    incomeTotal: "manual",
    expenseTotal: "manual",
    surplus: "computed",
  },
  editor: null,
  editedAt: null,
});

const keyedPartner = {
  name: "A named foundation",
  amount: 400,
  scopeKey: SCOPE_KEY,
};
const typedPartner = {
  name: "A local foundation",
  amount: 200,
  scope: "the wellbeing fund",
};

describe("buildReportBody partners", () => {
  it("sends nothing when the list is untouched", () => {
    const stored = latest([keyedPartner, typedPartner]);
    const drafts = toReportDrafts(stored, resolveScope);

    expect(buildReportBody(drafts, stored, resolveScope)).toEqual({});
  });

  it("sends the key back for a keyed partner when another partner changed", () => {
    const stored = latest([keyedPartner, typedPartner]);
    const drafts = toReportDrafts(stored, resolveScope);
    const edited = {
      ...drafts,
      partners: patchRow(drafts.partners, 1, { amount: "250" }),
    };

    expect(buildReportBody(edited, stored, resolveScope).partners).toEqual([
      { name: "A named foundation", amount: 400, scopeKey: SCOPE_KEY },
      { name: "A local foundation", amount: 250, scope: "the wellbeing fund" },
    ]);
  });

  it("drops the key and sends the typed words once the restriction is edited", () => {
    const stored = latest([keyedPartner]);
    const drafts = toReportDrafts(stored, resolveScope);
    const edited = {
      ...drafts,
      partners: patchRow(drafts.partners, 0, { scope: "a saúde mental" }),
    };

    expect(buildReportBody(edited, stored, resolveScope).partners).toEqual([
      { name: "A named foundation", amount: 400, scope: "a saúde mental" },
    ]);
  });
});
