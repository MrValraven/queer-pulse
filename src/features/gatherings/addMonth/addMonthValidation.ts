import type {
  EventBatchRowDto,
  EventBatchRowError,
} from "../api/eventBatch.api";
import { isPaidCostKind, isValidPaymentLink } from "../paymentDetails";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import { isValidJoinLink } from "../useGatheringForm";
import { EVENT_BATCH_MAX_BODY_BYTES } from "./addMonth.data";
import type { WallClockNow } from "./addMonthDates";
import { addMonthStateToDto, eventBatchBodyBytes } from "./addMonthPayload";
import type {
  AddMonthBlock,
  AddMonthRow,
  AddMonthRowIssue,
  AddMonthState,
  AddMonthTimes,
} from "./addMonthState";

// ── Add a month of events: what holds publishing back ──────────────────────
// Checks the page runs before sending, so a month the server would refuse
// is named on its own card first. Dates and times compare as strings: both
// are fixed-width wall clock in the template's zone.

/**
 * What is wrong with one card, in the order the host meets the fields. A date
 * before today (a draft restored days later) and today's date with a start
 * already gone both read as a passed start, the server's own refusal.
 */
export function rowIssues(
  row: AddMonthRow,
  sharedTimes: AddMonthTimes,
  now: WallClockNow,
): AddMonthRowIssue[] {
  const issues: AddMonthRowIssue[] = [];
  if (row.title.trim() === "") {
    issues.push({ field: "title", problem: "titleMissing" });
  }
  if (row.description.trim() === "") {
    issues.push({ field: "description", problem: "descriptionMissing" });
  }
  const startTime = row.timeOverride?.startTime ?? sharedTimes.startTime;
  const isDateBeforeToday = row.date < now.date;
  // A start on the current minute is gone by the time the request lands.
  const isStartPassedToday = row.date === now.date && startTime <= now.time;
  if (isDateBeforeToday || isStartPassedToday) {
    issues.push({ field: "startTime", problem: "startPassed" });
  }
  return issues;
}

/** Each card's issues by its date. A card with nothing wrong has no entry. */
export function issuesByDate(
  state: AddMonthState,
  now: WallClockNow,
): Record<string, AddMonthRowIssue[]> {
  const issues: Record<string, AddMonthRowIssue[]> = {};
  for (const row of state.rows) {
    const rowProblems = rowIssues(row, state.times, now);
    if (rowProblems.length > 0) issues[row.date] = rowProblems;
  }
  return issues;
}

/** Whether the edited place and cost would pass the server's link checks.
 *  Fields the host left on the starting event are always valid. */
export function isSharedValid(state: AddMonthState): boolean {
  const place = state.place;
  if (place && place.hood === ONLINE_HOOD_VALUE) {
    if (!isValidJoinLink(place.onlineUrl)) return false;
  }
  const cost = state.cost;
  if (cost && isPaidCostKind(cost.costKind)) {
    if (!isValidPaymentLink(cost.paymentUrl)) return false;
  }
  return true;
}

/** Whether the request body would pass `EVENT_BATCH_MAX_BODY_BYTES`. A state
 *  without a starting event has no body yet, so it reads as under the limit. */
export function isOverSizeLimit(state: AddMonthState): boolean {
  if (state.templateSlug === null) return false;
  return (
    eventBatchBodyBytes(addMonthStateToDto(state)) > EVENT_BATCH_MAX_BODY_BYTES
  );
}

function hasIssues(
  issues: Record<string, AddMonthRowIssue[]>,
  date: string,
): boolean {
  return (issues[date]?.length ?? 0) > 0;
}

/**
 * The first thing holding the Publish button back, in the order a host fixes
 * things, or null when the month can go. The size is judged after the cards,
 * so every title and description already sits within its own cap.
 * `loadedTemplateSlug` is the starting event whose details have loaded. While
 * a newly picked one loads, the page still shows the old event's dates and
 * times, so publishing waits for the picked event's details.
 */
export function publishBlock(
  state: AddMonthState,
  issues: Record<string, AddMonthRowIssue[]>,
  loadedTemplateSlug: string | null,
): AddMonthBlock | null {
  if (state.templateSlug === null) return { reason: "noTemplate" };
  if (loadedTemplateSlug !== state.templateSlug) {
    return { reason: "templateLoading" };
  }
  if (state.rows.length === 0) return { reason: "noDates" };
  if (!isSharedValid(state)) return { reason: "sharedInvalid" };
  const invalidRowCount = state.rows.filter((row) =>
    hasIssues(issues, row.date),
  ).length;
  if (invalidRowCount > 0) return { reason: "rowsInvalid", invalidRowCount };
  if (isOverSizeLimit(state)) return { reason: "tooLarge" };
  if (!state.pledges[0] || !state.pledges[1]) return { reason: "pledgesOpen" };
  return null;
}

/** The earliest date whose card has an issue, the one the page scrolls to. */
export function firstInvalidRowDate(
  state: AddMonthState,
  issues: Record<string, AddMonthRowIssue[]>,
): string | null {
  const invalidDates = state.rows
    .map((row) => row.date)
    .filter((date) => hasIssues(issues, date))
    .sort((first, second) => first.localeCompare(second));
  return invalidDates[0] ?? null;
}

/**
 * The card a server row error belongs to. The error's `date` is read first,
 * since `rowIndex` points into the rows that were sent and the cards may
 * have changed since; the sent row at `rowIndex` is the fallback. Null when
 * neither names a card the page still shows.
 */
export function serverIssueFor(
  rowError: EventBatchRowError,
  sentRows: EventBatchRowDto[],
  state: AddMonthState,
): { date: string; issue: AddMonthRowIssue } | null {
  const isShown = (date: string | undefined): date is string =>
    date !== undefined && state.rows.some((row) => row.date === date);
  const date = isShown(rowError.date)
    ? rowError.date
    : sentRows[rowError.rowIndex]?.date;
  if (!isShown(date)) return null;
  return { date, issue: { field: rowError.field, problem: "server" } };
}
