// Mirrors the "Wire contract" of
// QUEERPULSE-FUNDING-GRANTS-PLAN-1-BACKEND-2026-10-05.md. Change the two
// together: the backend runs `forbidNonWhitelisted`, so a field it does not
// know refuses the whole request.

export type FundingEligibility =
  "individuals" | "collectives" | "associations" | "companies" | "students";
export type FundingScope = "local" | "national" | "eu" | "international";
export type AskPurpose =
  "healthcare" | "housing" | "legal" | "emergency" | "project" | "event";
export type AskBeneficiary = "self" | "someone_i_know" | "project";
export type FundingKind = "call" | "ask";
export type FundingCallState = "open" | "closing" | "closed" | "stale";
export type FundingAskState = "pending" | "active" | "ended";
export type FundingEndReason = "goal_reached" | "closed";

/** The `funding` object on POST/PATCH `/forum/threads`. PATCH replaces it
 *  whole, so the frontend always sends every field it holds. `kind` is fixed
 *  at creation: a PATCH carries `funding` and never `kind`. */
export interface FundingInput {
  linkUrl: string;
  funderName?: string;
  amountMin?: number | null;
  amountMax?: number | null;
  /** ISO 8601; null is a rolling call. */
  deadline?: string | null;
  eligibility?: FundingEligibility[];
  scope?: FundingScope;
  goalAmount?: number;
  askPurpose?: AskPurpose;
  beneficiary?: AskBeneficiary;
  endsAt?: string | null;
}

/** `ForumThreadResponse.funding`. Every state is computed by the server at
 *  read time; the frontend renders it and recomputes nothing, with one
 *  display-only exception documented on `callDeadlineCopy`. */
export interface ForumFundingView {
  linkUrl: string;
  /** Lowercased host without "www.". */
  linkHost: string;
  funderName: string | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  eligibility: FundingEligibility[];
  scope: FundingScope | null;
  callState: FundingCallState | null;
  goalAmount: number | null;
  askPurpose: AskPurpose | null;
  beneficiary: AskBeneficiary | null;
  endsAt: string | null;
  endedAt: string | null;
  endedReason: FundingEndReason | null;
  /** When a moderator approved the fundraiser; cleared when an edit sends it
   *  back to review. Backs "Checked by moderators on {date}". */
  approvedAt: string | null;
  /** `endedAt` set reads `ended` first; any review state other than approved
   *  reads `pending` (a rejected ask too: `Thread.reviewState` tells them
   *  apart); an ask whose author erased their account reads `ended`. */
  askState: FundingAskState | null;
  updatedAt: string;
}

/** The segmented views on `/forum?category=funding`. `all` is the plain
 *  category list and never travels to the server. */
export type FundingListView =
  "all" | "open" | "closing" | "asks" | "discussion";
export type FundingWireView = Exclude<FundingListView, "all">;

/** `GET /forum/funding/lookup` 200 body. A 204 reads as null. */
export interface FundingLookupResult {
  slug: string;
  title: string;
  deadline: string | null;
}

export type FundingErrorCode =
  | "funding_kind_category_mismatch"
  | "funding_details_required"
  | "funding_details_not_allowed"
  | "funding_link_invalid"
  | "funding_link_host_not_allowed"
  | "funding_payment_details_in_body"
  | "funding_ask_not_anonymous"
  | "funding_ask_verification_required"
  | "funding_ask_limit_reached";
