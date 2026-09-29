/**
 * DTO → view adapters for the editor desk. Demo mode already produces
 * `Piece`/`Pitch` view shapes directly from `desk.data.ts`; live mode gets
 * `PieceListItemDto`/`PitchDto` from the backend and must be mapped to the
 * exact same view shape so desk UI components never branch on demoMode.
 */

import type {
  CurrentIssueDto,
  PieceListItemDto,
  PieceStage,
  PitchDto,
} from "./pieces.api";
import type { Issue, Piece, Pitch, Stage } from "../data/desk.data";

/** Backend stage codes → the view's display labels (`STAGE_STEP`/`DEMO_STAGES` keys).
 *  Missing an entry here is how a new stage leaks its raw machine value
 *  (`published`) onto an editor's screen, so this map stays exhaustive. */
export const STAGE_DTO_TO_VIEW: Record<PieceListItemDto["stage"], Stage> = {
  commissioned: "Commissioned",
  drafting: "Drafting",
  in_review: "In review",
  edit: "Edit",
  sensitivity_read: "Sensitivity read",
  layout: "Layout",
  ready: "Ready",
  published: "Published",
};

/** The view's display stage labels → backend stage codes (inverse of `STAGE_DTO_TO_VIEW`).
 *  Used by the Board layout's `onMove`, which works with the view's `Stage` labels but
 *  `usePieceMutations().moveStage` expects the backend `PieceStage` code. */
export const STAGE_VIEW_TO_DTO: Record<Stage, PieceStage> = {
  Commissioned: "commissioned",
  Drafting: "drafting",
  "In review": "in_review",
  Edit: "edit",
  "Sensitivity read": "sensitivity_read",
  Layout: "layout",
  Ready: "ready",
  Published: "published",
};

/** The editorial stages a piece is HANDED ON through, in order, in the
 *  backend's own codes. Drives "the next stage after this one" (the article
 *  editor's header "Send on" button), which is why `published` is absent: a
 *  piece is published by the publish action, never by being sent on. */
export const PIECE_STAGE_ORDER: PieceStage[] = [
  "commissioned",
  "drafting",
  "in_review",
  "edit",
  "sensitivity_read",
  "layout",
  "ready",
];

/** The stage right after `stage` in `PIECE_STAGE_ORDER`, or `null` when
 *  already at the last one ("ready": publishing is the only step left). */
export function nextPieceStage(stage: PieceStage): PieceStage | null {
  const index = PIECE_STAGE_ORDER.indexOf(stage);
  if (index === -1 || index === PIECE_STAGE_ORDER.length - 1) return null;
  return PIECE_STAGE_ORDER[index + 1] ?? null;
}

/**
 * The `YYYY-MM-DD` calendar date inside an ISO date string, or `undefined`
 * when the value is anything else. The backend sends `due` straight off the
 * Postgres `date` column (`"2026-08-04"`); demo rows hold display text
 * (`"4 Aug"`) and the `"ready"` sentinel, which both fall through here.
 * `due` names a day, so a trailing time part is tolerated and dropped.
 */
export function isoCalendarDate(value: string | null): string | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (!match) return undefined;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);
  // Round-trip through Date to reject impossible days such as 2026-02-31.
  const parsed = new Date(Date.UTC(year, monthIndex, day));
  const isRealDay =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === monthIndex &&
    parsed.getUTCDate() === day;
  return isRealDay ? `${yearText}-${monthText}-${dayText}` : undefined;
}

/** Maps a backend piece row to the desk UI's `Piece` view shape. */
export function pieceDtoToView(pieceDto: PieceListItemDto): Piece {
  const stage = STAGE_DTO_TO_VIEW[pieceDto.stage];
  // `"ready"` is the view's sentinel for "no date to chase": the desk row
  // renders it as a rule. A published piece has nothing left to be due
  // either, so it takes the same sentinel.
  const isPastDueDates = stage === "Ready" || stage === "Published";
  const due = isPastDueDates ? (pieceDto.due ?? "ready") : (pieceDto.due ?? "");

  return {
    id: pieceDto.id,
    title: pieceDto.title,
    format: pieceDto.format,
    section: pieceDto.section,
    kind: pieceDto.kind ?? "",
    byline: pieceDto.byline,
    editorId: pieceDto.editorId,
    stage,
    due,
    dueDate: isoCalendarDate(pieceDto.due),
    late: pieceDto.late,
    words: pieceDto.words ?? undefined,
    slides: pieceDto.slides ?? undefined,
    art: pieceDto.art,
    wait: pieceDto.waitingOn === "nobody" ? undefined : pieceDto.waitingOn,
    fresh: pieceDto.fresh,
    contentsBlurb: pieceDto.contentsBlurb,
    deckId: pieceDto.deckId ?? undefined,
    issueId: pieceDto.issueId,
    stageEnteredAt: pieceDto.stageEnteredAt,
    paymentStatus: pieceDto.paymentStatus,
  };
}

/** Maps a backend pitch row to the desk UI's `Pitch` view shape. */
export function pitchDtoToView(pitchDto: PitchDto): Pitch {
  return {
    id: pitchDto.id,
    title: pitchDto.title,
    byline: pitchDto.from,
    note: pitchDto.note,
    tags: pitchDto.tags,
    fresh: pitchDto.fresh,
    suggest: pitchDto.suggestFormat === "deck" ? "deck" : undefined,
    receivedAt: pitchDto.receivedAt,
  };
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** How the desk header prints an issue's days: day and short month, the
 *  prototype's "12 Aug" (Intl orders the two parts for each locale). */
export const DESK_CALENDAR_DAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/** Local midnight of an ISO calendar day, or `null` for anything else. A bare
 *  `YYYY-MM-DD` read as UTC would land on the previous day west of Greenwich. */
function localCalendarDay(value: string | null): Date | null {
  const calendarDate = isoCalendarDate(value);
  return calendarDate ? new Date(`${calendarDate}T00:00:00`) : null;
}

/** Whole calendar days from `today` to the ISO day `isoDate`, counted on the
 *  viewer's own calendar; 0 once that day has passed or when it is not a date. */
export function daysUntilCalendarDate(isoDate: string, today: Date): number {
  const targetDay = localCalendarDay(isoDate);
  if (!targetDay) return 0;
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  // `Math.round` absorbs the 23- and 25-hour days a DST change makes.
  const days = Math.round(
    (targetDay.getTime() - startOfToday.getTime()) / DAY_IN_MS,
  );
  return Math.max(0, days);
}

/** The two ISO days behind an issue's editorial calendar. */
export interface IssueCalendarDates {
  closesOn: string | null;
  publishedOn: string | null;
}

/**
 * The desk header's calendar fields for an issue, derived from its ISO days.
 * `formatDay` is the caller's locale-bound formatter (`useFormat().date` with
 * `DESK_CALENDAR_DAY_FORMAT`), so the strings follow the active language. An
 * unset day gives `""` (and a `daysLeft` of 0), which the header hides.
 */
export function issueCalendarToView(
  dates: IssueCalendarDates,
  formatDay: (day: Date) => string,
  today: Date,
): Pick<
  Issue,
  "closes" | "publishes" | "daysLeft" | "closesOn" | "publishedOn"
> {
  const closesDay = localCalendarDay(dates.closesOn);
  const publishesDay = localCalendarDay(dates.publishedOn);
  return {
    closes: closesDay ? formatDay(closesDay) : "",
    publishes: publishesDay ? formatDay(publishesDay) : "",
    daysLeft: dates.closesOn ? daysUntilCalendarDate(dates.closesOn, today) : 0,
    closesOn: dates.closesOn,
    publishedOn: dates.publishedOn,
  };
}

/**
 * Maps `GET /magazine/admin/issues/current` to the desk's `Issue`. The display
 * strings stay blank here: they depend on the active language and on today, so
 * the hook derives them with `issueCalendarToView` at render time, outside the
 * query cache.
 */
export function currentIssueDtoToView(currentIssueDto: CurrentIssueDto): Issue {
  return {
    id: currentIssueDto.id,
    number: currentIssueDto.number,
    theme: currentIssueDto.theme,
    closes: "",
    publishes: "",
    daysLeft: 0,
    filled: currentIssueDto.filled,
    slots: currentIssueDto.slots,
    closesOn: currentIssueDto.closesOn,
    publishedOn: currentIssueDto.publishedOn,
  };
}
