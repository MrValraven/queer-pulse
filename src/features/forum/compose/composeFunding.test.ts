import { describe, expect, it } from "vitest";
import {
  EMPTY_COMPOSE_THREAD_STATE,
  type ComposeFunding,
} from "./composeThread.types";
import {
  EMPTY_COMPOSE_FUNDING,
  composeFundingFromView,
  fundingBlockers,
  fundingFromDraftFields,
  fundingToDraftFields,
  parseWholeEuros,
  toFundingInput,
} from "./composeFunding";

const COMPLETE_CALL: ComposeFunding = {
  ...EMPTY_COMPOSE_FUNDING,
  linkUrl: "https://example.org/mare/apoio-projetos-2026",
  funderName: "Fundação Maré",
  amountMin: "500",
  amountMax: "2 000",
  deadlineLocal: "2026-07-31T17:00",
  eligibility: ["collectives"],
  scope: "national",
};

const COMPLETE_ASK: ComposeFunding = {
  ...EMPTY_COMPOSE_FUNDING,
  linkUrl: "https://www.gofundme.com/f/rui-recovery",
  goalAmount: "1500",
  askPurpose: "healthcare",
  beneficiary: "someone_i_know",
};

/** A fixed clock, so the deadlines above are in the future for every run. */
const NOW = Date.parse("2026-07-01T00:00:00.000Z");

function blockerIds(
  kind: "call" | "ask",
  funding: ComposeFunding,
  extra: Partial<Parameters<typeof fundingBlockers>[0]> = {},
) {
  return fundingBlockers({
    kind,
    funding,
    title: "A title",
    body: "A body",
    nowMs: NOW,
    ...extra,
  }).map((blocker) => blocker.id);
}

describe("composeFunding", () => {
  it("reads whole euros with spaces, dots or commas as thousands separators", () => {
    expect(parseWholeEuros("")).toBeNull();
    expect(parseWholeEuros("1 500")).toBe(1500);
    expect(parseWholeEuros("1.500")).toBe(1500);
    expect(parseWholeEuros("2,000")).toBe(2000);
    expect(parseWholeEuros("12.5")).toBeUndefined();
    expect(parseWholeEuros("abc")).toBeUndefined();
  });

  it("sends a call with its Lisbon deadline as an instant", () => {
    expect(toFundingInput("call", COMPLETE_CALL)).toEqual({
      linkUrl: "https://example.org/mare/apoio-projetos-2026",
      funderName: "Fundação Maré",
      amountMin: 500,
      amountMax: 2000,
      deadline: "2026-07-31T16:00:00.000Z",
      eligibility: ["collectives"],
      scope: "national",
    });
  });

  it("sends a rolling call with a null deadline", () => {
    expect(
      toFundingInput("call", { ...COMPLETE_CALL, isRolling: true }).deadline,
    ).toBeNull();
  });

  it("sends a fundraiser's fields only", () => {
    expect(
      toFundingInput("ask", { ...COMPLETE_ASK, endsOnLocal: "2026-07-31" }),
    ).toEqual({
      linkUrl: "https://www.gofundme.com/f/rui-recovery",
      goalAmount: 1500,
      askPurpose: "healthcare",
      beneficiary: "someone_i_know",
      endsAt: "2026-07-31T22:59:00.000Z",
    });
  });

  it("blocks an incomplete call, a bad link and a reversed amount range", () => {
    expect(blockerIds("call", EMPTY_COMPOSE_FUNDING)).toContain(
      "fundingIncomplete",
    );
    expect(
      blockerIds("call", { ...COMPLETE_CALL, linkUrl: "http://example.org" }),
    ).toContain("fundingLinkInvalid");
    expect(
      blockerIds("call", { ...COMPLETE_CALL, amountMin: "3000" }),
    ).toContain("fundingAmountOrder");
    expect(blockerIds("call", COMPLETE_CALL)).toEqual([]);
  });

  it("lets a rolling call through without a deadline", () => {
    expect(
      blockerIds("call", {
        ...COMPLETE_CALL,
        deadlineLocal: "",
        isRolling: true,
      }),
    ).toEqual([]);
  });

  it("refuses a deadline in the past or more than two years out", () => {
    expect(
      blockerIds("call", {
        ...COMPLETE_CALL,
        deadlineLocal: "2026-06-01T17:00",
      }),
    ).toContain("fundingDateOutOfRange");
    expect(
      blockerIds("call", {
        ...COMPLETE_CALL,
        deadlineLocal: "2028-12-01T17:00",
      }),
    ).toContain("fundingDateOutOfRange");
  });

  it("lets an unchanged deadline through an edit even after it has passed", () => {
    const closedCall = { ...COMPLETE_CALL, deadlineLocal: "2026-06-01T17:00" };
    expect(
      blockerIds("call", closedCall, {
        originalDeadlineLocal: "2026-06-01T17:00",
      }),
    ).toEqual([]);
  });

  it("keeps a fundraiser's last day within the next year", () => {
    expect(
      blockerIds("ask", { ...COMPLETE_ASK, endsOnLocal: "2027-09-01" }),
    ).toContain("fundingDateOutOfRange");
    expect(
      blockerIds("ask", { ...COMPLETE_ASK, endsOnLocal: "2026-08-15" }),
    ).toEqual([]);
  });

  it("holds a duplicate call until the member chooses to post anyway", () => {
    expect(
      blockerIds("call", COMPLETE_CALL, { isDuplicateUnconfirmed: true }),
    ).toEqual(["fundingDuplicate"]);
  });

  it("checks a fundraiser's host, payment details and verification", () => {
    expect(
      blockerIds("ask", {
        ...COMPLETE_ASK,
        linkUrl: "https://gofundme.com.evil.io/f",
      }),
    ).toContain("fundingHostNotAllowed");
    expect(
      blockerIds("ask", COMPLETE_ASK, {
        body: "Send to PT50 0002 0123 1234 5678 9015 4",
      }),
    ).toContain("fundingPaymentDetails");
    expect(
      blockerIds("ask", COMPLETE_ASK, { isAskVerificationMissing: true }),
    ).toContain("fundingVerification");
    expect(blockerIds("ask", COMPLETE_ASK)).toEqual([]);
  });

  it("round-trips through the draft's flat string array", () => {
    const fields = fundingToDraftFields(COMPLETE_CALL);
    expect(fields).not.toBeNull();
    expect(fundingFromDraftFields(fields)).toEqual(COMPLETE_CALL);
    expect(fundingToDraftFields(null)).toBeNull();
  });

  it("drops a stored value this build does not know", () => {
    const fields =
      fundingToDraftFields({ ...COMPLETE_CALL, scope: "national" }) ?? [];
    fields[6] = "mars";
    expect(fundingFromDraftFields(fields)?.scope).toBeNull();
    expect(fundingFromDraftFields(["too", "short"])).toBeNull();
  });

  it("refills the editor from a served call in Lisbon wall-clock time", () => {
    const funding = composeFundingFromView({
      linkUrl: "https://example.org/x",
      linkHost: "example.org",
      funderName: "Maré",
      amountMin: null,
      amountMax: 2000,
      deadline: "2026-07-31T16:00:00.000Z",
      eligibility: ["students"],
      scope: "eu",
      callState: "open",
      goalAmount: null,
      askPurpose: null,
      beneficiary: null,
      endsAt: null,
      endedAt: null,
      endedReason: null,
      approvedAt: null,
      askState: null,
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
    expect(funding.deadlineLocal).toBe("2026-07-31T17:00");
    expect(funding.amountMin).toBe("");
    expect(funding.amountMax).toBe("2000");
    expect(funding.isRolling).toBe(false);
  });

  it("starts the composer with no funding", () => {
    expect(EMPTY_COMPOSE_THREAD_STATE.funding).toBeNull();
  });
});
