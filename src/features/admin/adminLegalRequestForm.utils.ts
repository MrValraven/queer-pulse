import { todayIso } from "../../shared/lib/date";
import {
  DISCLOSING_LEGAL_REQUEST_OUTCOMES,
  MAX_ACCOUNTS_PER_LEGAL_REQUEST,
  type AdminLegalRequestDTO,
  type CreateLegalRequestBody,
  type LegalRequestDataCategory,
  type LegalRequestOutcome,
  type LegalRequestType,
} from "./api/adminLegalRequests.api";

/**
 * The register editor's draft, and the invariants the server judges a row on.
 *
 * Pure functions with no React, so the rules can be read (and reasoned about)
 * in one place rather than inferred from the fields that happen to render them.
 *
 * WHY THE RULES ARE MIRRORED HERE AT ALL. Every one of them is a 400 on the
 * backend, and a 400 arrives after the operator has already pressed save on a
 * form they believed was finished. The register is written under time pressure,
 * often with a lawyer on the phone, so the form says what is missing while
 * there is still a form to fix. The server stays the authority: nothing here
 * relaxes a rule, and a write that slips past this still gets refused.
 */

/** Counts and dates are held as the strings their inputs emit, so a half-typed
 *  number never has to be laundered through `NaN` on the way to state. */
export interface LegalRequestFormDraft {
  requestingBody: string;
  jurisdiction: string;
  requestType: LegalRequestType;
  /** `YYYY-MM-DD`, what `<input type="date">` emits. */
  receivedOn: string;
  accountsAffected: string;
  outcome: LegalRequestOutcome;
  dataDisclosed: LegalRequestDataCategory[];
  /** `YYYY-MM-DD`, or "" while the named members have not been told. */
  memberNotifiedOn: string;
  accountsNotified: string;
  notificationWithheldReason: string;
  isUnderGagOrder: boolean;
  internalNote: string;
}

/**
 * Everything the form can tell an operator before it sends anything. Each value
 * is a catalogue suffix resolved as `admin:legalRequests.problem.<problem>`.
 */
export type LegalRequestFormProblem =
  | "requestingBodyRequired"
  | "jurisdictionRequired"
  | "receivedOnRequired"
  | "accountsAffectedInvalid"
  | "accountsNotifiedInvalid"
  | "notifiedExceedsAffected"
  | "notifiedCountNeedsDate"
  | "notifiedDateNeedsCount"
  | "withheldReasonRequired";

/** An empty register row, ready for "Record a demand": pending until the team
 *  answers it, received today, nothing disclosed. */
export function emptyLegalRequestDraft(): LegalRequestFormDraft {
  return {
    requestingBody: "",
    jurisdiction: "",
    requestType: "subpoena",
    receivedOn: todayIso(),
    accountsAffected: "0",
    outcome: "pending",
    dataDisclosed: [],
    memberNotifiedOn: "",
    accountsNotified: "0",
    notificationWithheldReason: "",
    isUnderGagOrder: false,
    internalNote: "",
  };
}

/** Seed the editor from a record. Nullable text becomes "" so the inputs stay
 *  controlled; `draftToWriteBody` turns "" back into an explicit `null`, which
 *  is how a PATCH clears a field. */
export function draftFromLegalRequest(
  record: AdminLegalRequestDTO,
): LegalRequestFormDraft {
  return {
    requestingBody: record.requestingBody,
    jurisdiction: record.jurisdiction,
    requestType: record.requestType,
    receivedOn: record.receivedOn,
    accountsAffected: String(record.accountsAffected),
    outcome: record.outcome,
    dataDisclosed: [...record.dataDisclosed],
    memberNotifiedOn: record.memberNotifiedOn ?? "",
    accountsNotified: String(record.accountsNotified),
    notificationWithheldReason: record.notificationWithheldReason ?? "",
    isUnderGagOrder: record.isUnderGagOrder,
    internalNote: record.internalNote ?? "",
  };
}

/** A whole, non-negative count within the server's typo guard, or null when the
 *  field does not hold one. "" reads as 0, which is what an untouched count
 *  means. */
export function parseAccountCount(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (parsed > MAX_ACCOUNTS_PER_LEGAL_REQUEST) return null;
  return parsed;
}

/**
 * Every problem the draft carries, in the order the fields appear.
 *
 * The three cross-field rules are the ones the server judges on the MERGED
 * record, so the editor seeds every field from the record and sends every
 * field: the draft it validates IS the row the server will merge, and the two
 * can never disagree about a field the form left out.
 */
export function legalRequestDraftProblems(
  draft: LegalRequestFormDraft,
): LegalRequestFormProblem[] {
  const problems: LegalRequestFormProblem[] = [];

  if (draft.requestingBody.trim() === "")
    problems.push("requestingBodyRequired");
  if (draft.jurisdiction.trim() === "") problems.push("jurisdictionRequired");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.receivedOn)) {
    problems.push("receivedOnRequired");
  }

  const accountsAffected = parseAccountCount(draft.accountsAffected);
  const accountsNotified = parseAccountCount(draft.accountsNotified);
  if (accountsAffected === null) problems.push("accountsAffectedInvalid");
  if (accountsNotified === null) problems.push("accountsNotifiedInvalid");
  if (accountsAffected === null || accountsNotified === null) return problems;

  const hasNotifiedDate = draft.memberNotifiedOn.trim() !== "";

  // 1. Nobody can be notified who was not affected.
  if (accountsNotified > accountsAffected) {
    problems.push("notifiedExceedsAffected");
  }
  // 2. A notified count needs the day it happened, and
  if (accountsNotified > 0 && !hasNotifiedDate) {
    problems.push("notifiedCountNeedsDate");
  }
  // 3. a notification day needs a count, so "we told them" is never half a
  //    record.
  if (accountsNotified === 0 && hasNotifiedDate) {
    problems.push("notifiedDateNeedsCount");
  }
  // 4. Where data actually left the platform and nobody was told, the reason
  //    has to be on file, so "we did not tell them" is always a decision
  //    somebody wrote down rather than a blank nobody noticed.
  if (
    DISCLOSING_LEGAL_REQUEST_OUTCOMES.includes(draft.outcome) &&
    accountsAffected > 0 &&
    accountsNotified === 0 &&
    draft.notificationWithheldReason.trim() === ""
  ) {
    problems.push("withheldReasonRequired");
  }

  return problems;
}

/** True when the notification-withheld reason is the field standing between
 *  this draft and a saved record, so the editor can point at it directly. */
export function isWithheldReasonRequired(
  draft: LegalRequestFormDraft,
): boolean {
  const accountsAffected = parseAccountCount(draft.accountsAffected);
  const accountsNotified = parseAccountCount(draft.accountsNotified);
  return (
    accountsAffected !== null &&
    accountsNotified !== null &&
    DISCLOSING_LEGAL_REQUEST_OUTCOMES.includes(draft.outcome) &&
    accountsAffected > 0 &&
    accountsNotified === 0
  );
}

/**
 * The wire body for both writes. Sent whole on create AND on edit: `null` is
 * how a PATCH clears a nullable column, and an omitted key would instead leave
 * the old value standing behind a form that shows it as empty.
 *
 * Call it only on a draft `legalRequestDraftProblems` found clean; the counts
 * are parsed again here and fall back to 0, which never happens on a validated
 * draft.
 */
export function draftToLegalRequestBody(
  draft: LegalRequestFormDraft,
): CreateLegalRequestBody {
  const trimmedWithheldReason = draft.notificationWithheldReason.trim();
  const trimmedInternalNote = draft.internalNote.trim();
  return {
    requestingBody: draft.requestingBody.trim(),
    jurisdiction: draft.jurisdiction.trim(),
    requestType: draft.requestType,
    receivedOn: draft.receivedOn,
    accountsAffected: parseAccountCount(draft.accountsAffected) ?? 0,
    outcome: draft.outcome,
    dataDisclosed: draft.dataDisclosed,
    memberNotifiedOn: draft.memberNotifiedOn.trim() || null,
    accountsNotified: parseAccountCount(draft.accountsNotified) ?? 0,
    notificationWithheldReason: trimmedWithheldReason || null,
    isUnderGagOrder: draft.isUnderGagOrder,
    internalNote: trimmedInternalNote || null,
  };
}
