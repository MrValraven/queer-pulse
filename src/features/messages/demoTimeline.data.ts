// src/features/messages/demoTimeline.data.ts
import { activeLocale } from "../../shared/i18n/locale";
import { clockLabel, localDayKey, timeLabel } from "./api/messages.adapters";
import type { ChatMessage, Conversation } from "./data";

// ── DEMO timeline ────────────────────────────────────────────────────────────
// Every demo timestamp is an offset back from ONE anchor fixed at module load
// (a few minutes ago, yesterday at 15:10), so the seed always reads fresh
// while ids and ordering stay stable for the whole session. Labels are never
// baked strings: they are getters that format the ISO instant through the SAME
// functions the live adapter uses (`clockLabel`, `timeLabel`, `activeLocale()`),
// so a PT session reads PT and a language switch re-localizes on next render.

const DEMO_ANCHOR_MS = Date.now();
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

/** Mirrors the backend's `EDIT_WINDOW_MS` (`messaging.constants.ts`). The one
 *  frontend copy: the seed's `canEdit` stamp and the demo edit guard
 *  (`api/demoActionGuards.ts`) both read it. */
export const EDIT_WINDOW_MS = 15 * MINUTE_MS;

/** ISO instant `minutes` before the anchor. Keep same-thread "today" offsets
 *  at or under 120 so they never sort before a previous day's evening line. */
export function minutesAgo(minutes: number): string {
  return new Date(DEMO_ANCHOR_MS - minutes * MINUTE_MS).toISOString();
}

/** ISO instant `hours` after the anchor, for seeds that must sit in the
 *  future (a timed mute still in its window). */
export function hoursAfterAnchor(hours: number): string {
  return new Date(DEMO_ANCHOR_MS + hours * 60 * MINUTE_MS).toISOString();
}

/** ISO instant at local `hours:minutes:seconds`, `days` calendar days before
 *  the anchor. Use it for days >= 1 (and evening lines up to about 21:30). */
export function daysAgoAt(
  days: number,
  hours: number,
  minutes: number,
  seconds = 0,
): string {
  const date = new Date(DEMO_ANCHOR_MS);
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, seconds, 0);
  return new Date(
    Math.min(date.getTime(), DEMO_ANCHOR_MS - MINUTE_MS),
  ).toISOString();
}

/** Day heading token or date for a timestamp. Same rule as the live adapter's
 *  (unexported) `dayLabel`: "Today"/"Yesterday" stay machine tokens that
 *  `dayHeading` resolves through the catalog; older days are a date in the
 *  active locale. */
function demoDayLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const dayDistance = Math.round(
    (new Date(now.toDateString()).getTime() -
      new Date(date.toDateString()).getTime()) /
      DAY_MS,
  );
  if (dayDistance === 0) return "Today";
  if (dayDistance === 1) return "Yesterday";
  return date.toLocaleDateString(activeLocale(), {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** Defines a read-only, enumerable getter so a spread copy still carries the
 *  label value it had at copy time. */
function defineLabel<Target extends object>(
  target: Target,
  key: string,
  read: () => string,
): void {
  Object.defineProperty(target, key, {
    get: read,
    enumerable: true,
    configurable: true,
  });
}

/** One seeded message before the timeline adds its derived fields. `id` is a
 *  stable, readable server-style id; `at` is required so grouping, receipts
 *  and the unread divider all run on the live code paths. */
export type DemoMessageSeed = Omit<
  ChatMessage,
  "id" | "at" | "time" | "canEdit" | "canDelete" | "canReport" | "canPin"
> & {
  id: string;
  at: string;
  /** ENG-XXX evidence hold: stamps `canReport: true` on a non-author
   *  "deleted for everyone" tombstone even though `serverFlags`'s default
   *  rule reads any deleted message as unreportable. Mirrors the backend's
   *  30-day evidence-hold window on a tombstone (a non-author participant
   *  may still report it; the author, a moderator-removed message, or one
   *  past the hold cannot) — this demo has no real hold timer, so the flag
   *  is a fixed, hand-set exception instead. Absent/false for every other
   *  seed, including every other tombstone. */
  reportableTombstone?: boolean;
};

/** The viewer's standing in a demo thread, as the server sees it. */
export interface DemoThreadViewer {
  /** False once the viewer has left or been removed from a group. */
  isViewerActiveParticipant: boolean;
}

const ACTIVE_VIEWER: DemoThreadViewer = { isViewerActiveParticipant: true };

/**
 * The per-message flags exactly as `messaging-core.service.ts` computes them
 * for this viewer (ENG-241, ENG-254). The demo viewer is never staff.
 * - canPin: not deleted, and the viewer is an active participant.
 * - canEdit: not deleted, not a system pill, the viewer authored it, inside
 *   `EDIT_WINDOW_MS`, and the viewer is an active participant.
 * - canDelete: not deleted, not a system pill, the viewer authored it. No
 *   participant check: `deleteMessage` stays lenient for a member who left or
 *   was removed, so their own messages keep Delete there.
 * - canReport: authored by someone else, and either not deleted or (F1) a
 *   "deleted for everyone" tombstone the seed stamps `reportableTombstone`
 *   — the server's 30-day evidence-hold exception, never the author's own
 *   tombstone and never one past the hold (this demo has no hold timer, so
 *   a seed opts in by hand instead of it ever expiring).
 * A system pill's author is its actor.
 */
function serverFlags(
  seed: DemoMessageSeed,
  { isViewerActiveParticipant }: DemoThreadViewer,
): Pick<ChatMessage, "canEdit" | "canDelete" | "canReport" | "canPin"> {
  const isDeleted = !!seed.deletedAt;
  const isSystemMessage = seed.kind === "system";
  const isAuthor = isSystemMessage
    ? seed.systemEvent?.actorIsMe === true
    : seed.from === "me";
  const isWithinEditWindow =
    DEMO_ANCHOR_MS - new Date(seed.at).getTime() <= EDIT_WINDOW_MS;
  return {
    canPin: !isDeleted && isViewerActiveParticipant,
    canEdit:
      !isDeleted &&
      !isSystemMessage &&
      isAuthor &&
      isWithinEditWindow &&
      isViewerActiveParticipant,
    canDelete: !isDeleted && !isSystemMessage && isAuthor,
    canReport: !isAuthor && (!isDeleted || seed.reportableTombstone === true),
  };
}

/** Turns oldest-first seeds into the `{ day, dayKey, items }[]` buckets the
 *  panel renders, bucketed by local calendar day like `groupMessages`. Each
 *  `at` is nudged forward if it would sort before the previous one (an odd
 *  load time near midnight), so the log never interleaves days. Pass
 *  `{ isViewerActiveParticipant: false }` for a group the viewer left or was
 *  removed from, so its flags match what the server would send them. */
export function demoThread(
  seeds: DemoMessageSeed[],
  viewer: DemoThreadViewer = ACTIVE_VIEWER,
): Conversation["messages"] {
  const buckets: Conversation["messages"] = [];
  let previousMs = Number.NEGATIVE_INFINITY;
  for (const seed of seeds) {
    const atMs = Math.max(new Date(seed.at).getTime(), previousMs + 1000);
    previousMs = atMs;
    const at = new Date(atMs).toISOString();
    const message: ChatMessage = { ...seed, at, ...serverFlags(seed, viewer) };
    defineLabel(message, "time", () => clockLabel(at));
    const dayKey = localDayKey(new Date(atMs));
    const lastBucket = buckets.at(-1);
    if (lastBucket && lastBucket.dayKey === dayKey) {
      lastBucket.items.push(message);
      continue;
    }
    const bucket = { dayKey, items: [message] } as Conversation["messages"][0];
    defineLabel(bucket, "day", () => demoDayLabel(at));
    buckets.push(bucket);
  }
  return buckets;
}

/** The ISO instant of the newest message in a demo thread. */
function lastMessageAt(messages: Conversation["messages"]): string {
  return (
    messages.at(-1)?.items.at(-1)?.at ?? new Date(DEMO_ANCHOR_MS).toISOString()
  );
}

/** A demo inbox row before the timeline derives its labels. */
export type DemoConversationSeed = Omit<
  Conversation,
  "time" | "updatedAt" | "connectedSince"
> & {
  /** ISO date the two members connected (DMs), or absent for groups and the
   *  official thread. */
  connectedSinceAt?: string;
};

/** Finishes a demo row: `updatedAt` is its newest message (so
 *  `useThreadRowTimeLabel` formats and re-derives it like a live row), `time`
 *  is the same label as a getter for surfaces that still read it, and
 *  `connectedSince` formats like the live adapter's `connectedSinceLabel`. */
export function demoConversation(seed: DemoConversationSeed): Conversation {
  const { connectedSinceAt, ...rest } = seed;
  const updatedAt = lastMessageAt(seed.messages);
  const conversation = { ...rest, updatedAt } as Conversation;
  defineLabel(conversation, "time", () => timeLabel(updatedAt));
  defineLabel(conversation, "connectedSince", () =>
    connectedSinceAt
      ? new Date(connectedSinceAt).toLocaleDateString(activeLocale(), {
          month: "short",
          year: "numeric",
        })
      : "",
  );
  return conversation;
}
