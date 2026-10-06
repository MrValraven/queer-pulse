import { CLOSING_SOON_MS, STALE_ROLLING_MS } from "./funding.data";
import { fundingLinkHost } from "./fundingLink";
import type {
  ForumFundingView,
  FundingCallState,
  FundingInput,
  FundingKind,
} from "./funding.types";

/** The contract's call-state rule. Used ONLY to build demo threads and the
 *  optimistic card; live always renders the server's `callState`. */
export function callStateAt(
  deadline: string | null,
  updatedAt: string,
  nowMs: number,
): FundingCallState {
  if (deadline === null) {
    return nowMs - Date.parse(updatedAt) > STALE_ROLLING_MS ? "stale" : "open";
  }
  const deadlineMs = Date.parse(deadline);
  if (deadlineMs < nowMs) return "closed";
  return deadlineMs <= nowMs + CLOSING_SOON_MS ? "closing" : "open";
}

/** A `ForumFundingView` built from what the composer sends, for the demo
 *  corpus and the optimistic card. */
export function previewFundingView(
  kind: FundingKind,
  input: FundingInput,
  nowMs: number,
  overrides: Partial<ForumFundingView> = {},
): ForumFundingView {
  const isCall = kind === "call";
  const updatedAt = overrides.updatedAt ?? new Date(nowMs).toISOString();
  const deadline = isCall ? (input.deadline ?? null) : null;
  return {
    linkUrl: input.linkUrl,
    linkHost: fundingLinkHost(input.linkUrl) ?? "",
    funderName: isCall ? (input.funderName ?? null) : null,
    amountMin: isCall ? (input.amountMin ?? null) : null,
    amountMax: isCall ? (input.amountMax ?? null) : null,
    deadline,
    eligibility: isCall ? [...(input.eligibility ?? [])] : [],
    scope: isCall ? (input.scope ?? null) : null,
    callState: isCall ? callStateAt(deadline, updatedAt, nowMs) : null,
    goalAmount: isCall ? null : (input.goalAmount ?? null),
    askPurpose: isCall ? null : (input.askPurpose ?? null),
    beneficiary: isCall ? null : (input.beneficiary ?? null),
    endsAt: isCall ? null : (input.endsAt ?? null),
    endedAt: null,
    endedReason: null,
    approvedAt: null,
    askState: isCall ? null : "pending",
    updatedAt,
    ...overrides,
  };
}
