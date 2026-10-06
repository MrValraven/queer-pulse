import {
  ASK_END_MAX_MS,
  CALL_DEADLINE_MAX_MS,
  FUNDRAISING_HOSTS,
  parseAskPurpose,
  parseBeneficiary,
  parseEligibility,
  parseScope,
} from "../funding/funding.data";
import {
  findPaymentDetails,
  isAllowedFundraisingHost,
  parseHttpsUrl,
} from "../funding/fundingLink";
import {
  isoToLisbonWallClock,
  lisbonEndOfDayIso,
  lisbonWallClockToIso,
} from "../funding/fundingDates";
import type {
  ForumFundingView,
  FundingInput,
  FundingKind,
} from "../funding/funding.types";
import type {
  ComposeBlocker,
  ComposeBlockerId,
  ComposeFunding,
  PostKind,
} from "./composeThread.types";

export const EMPTY_COMPOSE_FUNDING: ComposeFunding = {
  linkUrl: "",
  funderName: "",
  amountMin: "",
  amountMax: "",
  deadlineLocal: "",
  isRolling: false,
  eligibility: [],
  scope: null,
  goalAmount: "",
  askPurpose: null,
  beneficiary: null,
  endsOnLocal: "",
};

/** Blockers the composer already states in full beside their field: the
 *  host refusal under the link, the payment notice under the body. */
const INLINE_FUNDING_BLOCKER_IDS: readonly ComposeBlockerId[] = [
  "fundingHostNotAllowed",
  "fundingPaymentDetails",
];

/** The footer's copy of the blockers: one already said beside its field
 *  becomes a pointer to it, so the same sentence never shows twice. While the
 *  link field is not on screen (a fundraiser's verification still loading,
 *  or its gate), the host refusal keeps its full sentence in the footer. */
export function withInlineFundingPointers(
  blockers: readonly ComposeBlocker[],
  { isLinkFieldShown = true }: { isLinkFieldShown?: boolean } = {},
): ComposeBlocker[] {
  return blockers.map((blocker) => {
    const isInline =
      INLINE_FUNDING_BLOCKER_IDS.includes(blocker.id) &&
      (isLinkFieldShown || blocker.id !== "fundingHostNotAllowed");
    return isInline
      ? { id: blocker.id, messageKey: "forum:composePage.foot.seeAbove" }
      : blocker;
  });
}

export function isFundingKind(
  kind: PostKind | null | undefined,
): kind is FundingKind {
  return kind === "call" || kind === "ask";
}

const GROUPED_WHOLE_NUMBER = /^\d{1,3}(?:[.,]\d{3})+$/;
const PLAIN_WHOLE_NUMBER = /^\d{1,9}$/;

/** Blank is null ("not stated"); a whole number, with spaces or with dots or
 *  commas grouping thousands, is that number; anything else is undefined
 *  ("not a whole number"), which `fundingBlockers` reports. */
export function parseWholeEuros(raw: string): number | null | undefined {
  const compact = raw.replace(/\s+/g, "");
  if (!compact) return null;
  if (PLAIN_WHOLE_NUMBER.test(compact)) return Number(compact);
  if (GROUPED_WHOLE_NUMBER.test(compact))
    return Number(compact.replace(/[.,]/g, ""));
  return undefined;
}

export function toFundingInput(
  kind: FundingKind,
  funding: ComposeFunding,
): FundingInput {
  const linkUrl = funding.linkUrl.trim();
  if (kind === "call") {
    return {
      linkUrl,
      funderName: funding.funderName.trim(),
      amountMin: parseWholeEuros(funding.amountMin) ?? null,
      amountMax: parseWholeEuros(funding.amountMax) ?? null,
      deadline: funding.isRolling
        ? null
        : lisbonWallClockToIso(funding.deadlineLocal),
      eligibility: [...funding.eligibility],
      ...(funding.scope ? { scope: funding.scope } : {}),
    };
  }
  const goalAmount = parseWholeEuros(funding.goalAmount);
  return {
    linkUrl,
    ...(typeof goalAmount === "number" ? { goalAmount } : {}),
    ...(funding.askPurpose ? { askPurpose: funding.askPurpose } : {}),
    ...(funding.beneficiary ? { beneficiary: funding.beneficiary } : {}),
    endsAt: funding.endsOnLocal ? lisbonEndOfDayIso(funding.endsOnLocal) : null,
  };
}

export interface FundingBlockerInput {
  kind: PostKind | null;
  funding: ComposeFunding | null;
  title: string;
  body: string;
  isDuplicateUnconfirmed?: boolean;
  isAskVerificationMissing?: boolean;
  /** The values stored on the thread being edited. An unchanged date passes
   *  even after it has passed (Plan 1, spec delta 13). */
  originalDeadlineLocal?: string;
  originalEndsOnLocal?: string;
  /** Injectable clock for tests. */
  nowMs?: number;
}

/** A changed date must sit between now and `maxAheadMs` from now. */
function isDateOutOfRange(
  iso: string | null,
  nowMs: number,
  maxAheadMs: number,
): boolean {
  if (iso === null) return false;
  const instant = Date.parse(iso);
  return instant <= nowMs || instant > nowMs + maxAheadMs;
}

/** What stops a call or a fundraiser from publishing. Empty for every other
 *  kind. Pure, so the composer and the edit modal share one rule. */
export function fundingBlockers({
  kind,
  funding: maybeFunding,
  title,
  body,
  isDuplicateUnconfirmed = false,
  isAskVerificationMissing = false,
  originalDeadlineLocal,
  originalEndsOnLocal,
  nowMs = Date.now(),
}: FundingBlockerInput): ComposeBlocker[] {
  if (!isFundingKind(kind)) return [];
  const funding = maybeFunding ?? EMPTY_COMPOSE_FUNDING;
  const blockers: ComposeBlocker[] = [];
  const hasLinkText = funding.linkUrl.trim() !== "";
  const isLinkValid = parseHttpsUrl(funding.linkUrl) !== null;
  if (kind === "ask" && isAskVerificationMissing) {
    blockers.push({
      id: "fundingVerification",
      messageKey: "forum:composePage.blocker.fundingVerification",
    });
  }
  if (hasLinkText && !isLinkValid) {
    blockers.push({
      id: "fundingLinkInvalid",
      messageKey: "forum:composePage.blocker.fundingLinkInvalid",
    });
  }
  if (kind === "call") {
    const amountMin = parseWholeEuros(funding.amountMin);
    const amountMax = parseWholeEuros(funding.amountMax);
    const hasDeadline =
      funding.isRolling || lisbonWallClockToIso(funding.deadlineLocal) !== null;
    if (
      !isLinkValid ||
      !funding.funderName.trim() ||
      !funding.scope ||
      !hasDeadline
    ) {
      blockers.push({
        id: "fundingIncomplete",
        messageKey: "forum:composePage.blocker.fundingIncomplete",
      });
    }
    const isRangeReversed =
      typeof amountMin === "number" &&
      typeof amountMax === "number" &&
      amountMax < amountMin;
    if (amountMin === undefined || amountMax === undefined || isRangeReversed) {
      blockers.push({
        id: "fundingAmountOrder",
        messageKey: "forum:composePage.blocker.fundingAmountOrder",
      });
    }
    const isDeadlineChanged = funding.deadlineLocal !== originalDeadlineLocal;
    const deadline = funding.isRolling
      ? null
      : lisbonWallClockToIso(funding.deadlineLocal);
    if (
      isDeadlineChanged &&
      isDateOutOfRange(deadline, nowMs, CALL_DEADLINE_MAX_MS)
    ) {
      blockers.push({
        id: "fundingDateOutOfRange",
        messageKey: "forum:composePage.blocker.fundingDeadlineRange",
      });
    }
    if (isDuplicateUnconfirmed) {
      blockers.push({
        id: "fundingDuplicate",
        messageKey: "forum:composePage.blocker.fundingDuplicate",
      });
    }
    return blockers;
  }
  const goalAmount = parseWholeEuros(funding.goalAmount);
  if (
    !isLinkValid ||
    typeof goalAmount !== "number" ||
    goalAmount <= 0 ||
    !funding.askPurpose ||
    !funding.beneficiary
  ) {
    blockers.push({
      id: "fundingIncomplete",
      messageKey: "forum:composePage.blocker.fundingAskIncomplete",
    });
  }
  if (isLinkValid && !isAllowedFundraisingHost(funding.linkUrl)) {
    blockers.push({
      id: "fundingHostNotAllowed",
      messageKey: "forum:composePage.blocker.fundingHostNotAllowed",
      values: { hosts: FUNDRAISING_HOSTS.join(", ") },
    });
  }
  if (findPaymentDetails(`${title}\n${body}`)) {
    blockers.push({
      id: "fundingPaymentDetails",
      messageKey: "forum:composePage.blocker.fundingPaymentDetails",
    });
  }
  const isEndChanged = funding.endsOnLocal !== originalEndsOnLocal;
  const endsAt = funding.endsOnLocal
    ? lisbonEndOfDayIso(funding.endsOnLocal)
    : null;
  if (isEndChanged && isDateOutOfRange(endsAt, nowMs, ASK_END_MAX_MS)) {
    blockers.push({
      id: "fundingDateOutOfRange",
      messageKey: "forum:composePage.blocker.fundingEndsOnRange",
    });
  }
  return blockers;
}

/** The editor's state for a served call or fundraiser (the edit modal). */
export function composeFundingFromView(view: ForumFundingView): ComposeFunding {
  return {
    linkUrl: view.linkUrl,
    funderName: view.funderName ?? "",
    amountMin: view.amountMin === null ? "" : String(view.amountMin),
    amountMax: view.amountMax === null ? "" : String(view.amountMax),
    deadlineLocal: view.deadline
      ? (isoToLisbonWallClock(view.deadline) ?? "")
      : "",
    isRolling: view.callState !== null && view.deadline === null,
    eligibility: [...view.eligibility],
    scope: view.scope,
    goalAmount: view.goalAmount === null ? "" : String(view.goalAmount),
    askPurpose: view.askPurpose,
    beneficiary: view.beneficiary,
    endsOnLocal: view.endsAt
      ? (isoToLisbonWallClock(view.endsAt) ?? "").slice(0, 10)
      : "",
  };
}

// The draft row's `meta` bag holds flat scalars and string arrays only, at
// most 32 keys (23 in use), each string at most 2048 characters. The funding
// details therefore travel as ONE positional string array: eleven fixed slots,
// then the eligibility values. A link is capped at the column's 2048.
const FIXED_FIELD_COUNT = 11;
const LINK_MAX_LENGTH = 2048;

export function fundingToDraftFields(
  funding: ComposeFunding | null,
): string[] | null {
  if (!funding) return null;
  return [
    funding.linkUrl.slice(0, LINK_MAX_LENGTH),
    funding.funderName,
    funding.amountMin,
    funding.amountMax,
    funding.deadlineLocal,
    funding.isRolling ? "1" : "",
    funding.scope ?? "",
    funding.goalAmount,
    funding.askPurpose ?? "",
    funding.beneficiary ?? "",
    funding.endsOnLocal,
    ...funding.eligibility,
  ];
}

export function fundingFromDraftFields(
  fields: readonly string[] | null | undefined,
): ComposeFunding | null {
  if (!fields || fields.length < FIXED_FIELD_COUNT) return null;
  const at = (index: number) => fields[index] ?? "";
  return {
    linkUrl: at(0),
    funderName: at(1),
    amountMin: at(2),
    amountMax: at(3),
    deadlineLocal: at(4),
    isRolling: at(5) === "1",
    scope: parseScope(at(6)),
    goalAmount: at(7),
    askPurpose: parseAskPurpose(at(8)),
    beneficiary: parseBeneficiary(at(9)),
    endsOnLocal: at(10),
    eligibility: parseEligibility(fields.slice(FIXED_FIELD_COUNT)),
  };
}
