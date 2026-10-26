import type { IconType } from "react-icons";
import {
  FiBriefcase,
  FiCalendar,
  FiEdit3,
  FiFileText,
  FiMessageCircle,
  FiMessageSquare,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import { relativeAgo } from "../../shared/lib/relativeAgo";
import type { ActivityAction } from "./api/members.api";
import type { ActivityItem } from "./data/members";

/** Rows shown before the rest fold behind "Show N more". */
export const ACTIVITY_VISIBLE_COUNT = 5;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export type ActivityPeriod = "thisWeek" | "thisMonth" | "earlier";

/** The quiet colour family a row's badge is tinted with. */
export type ActivityTone =
  "persona" | "community" | "event" | "conversation" | "writing" | "neutral";

/** Each action's own icon and tint. Wins over the kind-mapped `item.icon`. */
const ACTION_META: Record<
  ActivityAction,
  { icon: IconType; tone: ActivityTone; verbKey: string }
> = {
  persona: {
    icon: FiBriefcase,
    tone: "persona",
    verbKey: "members:content.activity.verb.persona",
  },
  join: {
    icon: FiUsers,
    tone: "community",
    verbKey: "members:content.activity.verb.join",
  },
  rsvp: {
    icon: FiCalendar,
    tone: "event",
    verbKey: "members:content.activity.verb.rsvp",
  },
  thread: {
    icon: FiMessageSquare,
    tone: "conversation",
    verbKey: "members:content.activity.verb.thread",
  },
  communityPost: {
    icon: FiEdit3,
    tone: "writing",
    verbKey: "members:content.activity.verb.communityPost",
  },
};

/** Rows written before `action` existed still carry the kind's icon (see
 *  `ACTIVITY_ICONS` in members.adapters.ts); this tints them by that family. */
const ICON_TONES = new Map<IconType, ActivityTone>([
  [FiUserPlus, "persona"],
  [FiUsers, "community"],
  [FiCalendar, "event"],
  [FiMessageCircle, "conversation"],
  [FiFileText, "writing"],
  [FiEdit3, "writing"],
]);

export interface ActivityRowView {
  key: string;
  item: ActivityItem;
  icon: IconType;
  tone: ActivityTone;
  /** Catalog key of the small verb line, or null to render `title` whole. */
  verbKey: string | null;
  /** The prominent serif line: `subject` under a verb, else the full title. */
  headline: string;
  /** Epoch ms, or null when the row has no usable time. */
  occurredAtMs: number | null;
}

export type ActivityTimelineNode =
  | { type: "period"; key: string; period: ActivityPeriod }
  | { type: "row"; key: string; row: ActivityRowView };

function parseTime(iso: string | null): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
}

function toRowView(item: ActivityItem, index: number): ActivityRowView {
  // A verb needs its subject: an action sent without one renders the title.
  const phrasedSubject = item.action && item.subject ? item.subject : null;
  const actionMeta = item.action ? ACTION_META[item.action] : null;
  return {
    key: `${item.action ?? "title"}-${item.subject ?? item.title}-${index}`,
    item,
    icon: actionMeta?.icon ?? item.icon,
    tone: actionMeta?.tone ?? ICON_TONES.get(item.icon) ?? "neutral",
    verbKey: phrasedSubject ? (actionMeta?.verbKey ?? null) : null,
    headline: phrasedSubject ?? item.title,
    occurredAtMs: parseTime(item.occurredAt),
  };
}

/** Newest first; rows without a time keep their order at the end. Repeats of
 *  the same action on the same subject and destination fold into the newest,
 *  since the feed has sent one row per persona save. */
export function prepareActivityRows(items: ActivityItem[]): ActivityRowView[] {
  const sortedRows = items
    .map(toRowView)
    .sort(
      (first, second) =>
        (second.occurredAtMs ?? -Infinity) - (first.occurredAtMs ?? -Infinity),
    );
  const seenKeys = new Set<string>();
  return sortedRows.filter((row) => {
    const { item } = row;
    const dedupeKey = [
      item.action ?? "",
      item.action ? (item.subject ?? item.title) : item.title,
      item.to ?? "",
    ].join("\u0000");
    if (seenKeys.has(dedupeKey)) return false;
    seenKeys.add(dedupeKey);
    return true;
  });
}

function periodOf(occurredAtMs: number | null, now: number): ActivityPeriod {
  if (occurredAtMs === null) return "earlier";
  if (now - occurredAtMs < WEEK_MS) return "thisWeek";
  const occurred = new Date(occurredAtMs);
  const today = new Date(now);
  const isSameMonth =
    occurred.getFullYear() === today.getFullYear() &&
    occurred.getMonth() === today.getMonth();
  return isSameMonth ? "thisMonth" : "earlier";
}

/** Rows with a period heading before each run, split so the first
 *  `visibleCount` rows show and the rest fold. A heading whose first row
 *  folds away folds with it, so no heading is left dangling above the button. */
export function buildActivityTimeline(
  rows: ActivityRowView[],
  visibleCount: number,
  now: number = Date.now(),
): {
  visibleNodes: ActivityTimelineNode[];
  foldedNodes: ActivityTimelineNode[];
} {
  const nodes: ActivityTimelineNode[] = [];
  let currentPeriod: ActivityPeriod | null = null;
  let splitIndex = -1;
  rows.forEach((row, rowIndex) => {
    const period = periodOf(row.occurredAtMs, now);
    if (period !== currentPeriod) {
      nodes.push({ type: "period", key: `period-${period}`, period });
      currentPeriod = period;
    }
    if (rowIndex === visibleCount) splitIndex = nodes.length;
    nodes.push({ type: "row", key: row.key, row });
  });
  if (splitIndex < 0) return { visibleNodes: nodes, foldedNodes: [] };
  if (nodes[splitIndex - 1]?.type === "period") splitIndex -= 1;
  return {
    visibleNodes: nodes.slice(0, splitIndex),
    foldedNodes: nodes.slice(splitIndex),
  };
}

/** "3 days ago" under a week (the shared `relativeAgo`), then weeks, months
 *  and years through the locale's own `Intl.RelativeTimeFormat`. */
export function activityAgo(
  occurredAtMs: number,
  t: TFunction,
  fmt: Formatters,
  now: number = Date.now(),
): string {
  const delta = Math.max(0, now - occurredAtMs);
  if (delta < WEEK_MS) {
    return relativeAgo(
      new Date(occurredAtMs).toISOString(),
      t,
      fmt,
      {
        justNow: "members:content.activity.justNow",
        unknown: "members:content.activity.unknownTime",
      },
      now,
    );
  }
  const days = Math.floor(delta / DAY_MS);
  if (days < 30) return fmt.relativeTime(-Math.floor(days / 7), "week");
  if (days < 365) return fmt.relativeTime(-Math.floor(days / 30), "month");
  return fmt.relativeTime(-Math.floor(days / 365), "year");
}
