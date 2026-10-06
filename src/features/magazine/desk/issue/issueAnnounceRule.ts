/**
 * PRD-438: whether shipping an issue at `now` can ring members' bells.
 *
 * DUPLICATED RULE. This mirrors the date half of `isAnnouncementDue` in
 * `queerpulse-backend/src/magazine/magazine-issue-announcer.service.ts`, and
 * the clock it reads in `queerpulse-backend/src/magazine/magazine-clock.ts`
 * (`MAGAZINE_TIMEZONE`, `ISSUE_PUBLISH_HOUR`, `magazineTodayIsoDate`,
 * `magazineIssueVisibleThroughDate`). The server decides; this copy exists so
 * the desk can say what a ship will do before the click. Change both sides
 * together.
 *
 * The server announces an issue once, right after a ship, and only when its
 * date is visible to readers at that moment: on or before today in Lisbon,
 * and from 09:00 Lisbon time when the date is today. The module has no
 * scheduled job, so a ship made before then goes out quietly and nothing
 * rings the bell later. The other conditions (the toggle is on, the issue was
 * never announced, the ship published at least one piece) are the caller's
 * to check; the desk already holds the first two.
 */

import type { IssueProductionDto } from "../../api/issueProduction.api";

export const MAGAZINE_TIME_ZONE = "Europe/Lisbon";

/** The hour an issue goes live on its date, in `MAGAZINE_TIME_ZONE`. */
export const ISSUE_PUBLISH_HOUR = 9;

/** Today as `YYYY-MM-DD` in the magazine's own zone. `en-CA` renders exactly
 *  that shape, so it compares as a string against an issue's `publishedOn`. */
export function magazineTodayIsoDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MAGAZINE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The latest issue date readers can see at `now`: today from 09:00 Lisbon
 *  time, yesterday before it. */
export function magazineIssueVisibleThroughDate(
  now: Date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MAGAZINE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const partValue = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  // Some ICU versions render midnight as `24`; the server folds it the same way.
  const hour = partValue("hour") % 24;
  const visibleDay =
    hour >= ISSUE_PUBLISH_HOUR ? partValue("day") : partValue("day") - 1;
  // `Date.UTC` rolls day 0 back into the previous month (and year).
  return new Date(
    Date.UTC(partValue("year"), partValue("month") - 1, visibleDay),
  )
    .toISOString()
    .slice(0, 10);
}

/**
 * Whether a ship at `now` meets the announcement's date rule. An issue with
 * no date yet is dated today by the ship itself, exactly as `shipIssue` does.
 */
export function isShipDateAnnounceable(
  publishedOn: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const issueDate = publishedOn || magazineTodayIsoDate(now);
  return issueDate <= magazineIssueVisibleThroughDate(now);
}

/**
 * The toggle is on and the issue has never been announced: the desk still
 * expects a ship to ring members' bells.
 */
export function isIssueAnnouncePending(
  digestSendOnPublish: boolean,
  digestSentAt: string | null,
): boolean {
  return digestSendOnPublish && digestSentAt === null;
}

/**
 * The issue has shipped and its pieces already carry a publish instant, yet
 * the bell never rang. The server announces a ship only through that ship's
 * own `publishedPieceIds`, and a ship stamps only pieces with no
 * `publishedAt` yet (`shipIssue` in
 * `queerpulse-backend/src/magazine/magazine-piece.service.ts`), so every
 * stamped piece is spent: a later ship announces the issue only by putting a
 * piece live for the first time.
 *
 * Read from the pieces themselves: `lastShip` is overwritten by every ship,
 * so after a quiet ship an empty re-ship would leave `publishedPieceIds`
 * empty and hide the spent pieces. A future-dated instant counts as spent
 * too, since a quiet ship stamps 09:00 on the issue date.
 */
export function hasShippedWithoutAnnouncement(
  isAnnouncePending: boolean,
  lastShip: object | null | undefined,
  pieces: readonly { publishedAt: string | null }[],
): boolean {
  return (
    isAnnouncePending &&
    lastShip != null &&
    pieces.some((piece) => piece.publishedAt !== null)
  );
}

/** Both announcement facts for an issue, computed once by the page that
 *  holds the production record and handed to the ship modal and the issue
 *  panel tab, so the two never disagree. */
export function issueAnnounceState(
  production: Pick<
    IssueProductionDto,
    "digestSendOnPublish" | "digestSentAt" | "lastShip" | "runOrder"
  >,
): { isAnnouncePending: boolean; hasShippedQuietly: boolean } {
  const isAnnouncePending = isIssueAnnouncePending(
    production.digestSendOnPublish,
    production.digestSentAt,
  );
  return {
    isAnnouncePending,
    hasShippedQuietly: hasShippedWithoutAnnouncement(
      isAnnouncePending,
      production.lastShip,
      production.runOrder.map((entry) => entry.piece),
    ),
  };
}
