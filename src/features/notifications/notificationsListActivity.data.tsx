import { FiBookOpen, FiClock } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { memberName } from "../members/data/members";
import { Translation } from "../../shared/i18n/Translation";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { Notification } from "./notifications.types";

/** Milliseconds in each unit the demo rows express their age in. Mirrors the
 * copy in `notificationsList.data.tsx` (kept local here rather than imported,
 * to avoid a circular import between the two demo-data modules). */
const UNIT_MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
} as const;

/** The ISO timestamp behind a demo row's relative `time` label. See
 * `agoIso` in `notificationsList.data.tsx` for the canonical doc comment. */
function agoIso(amount: number, unit: keyof typeof UNIT_MS): string {
  return new Date(Date.now() - amount * UNIT_MS[unit]).toISOString();
}

/**
 * The back half of the unread demo feed (ids 4, 5, 6, 7), split out of
 * `buildUnreadNotifications` in `notificationsList.data.tsx` to keep that
 * function under the per-function line limit. Order-preserving: the caller
 * spreads this after ids 2, 3, 13 so the feed still reads id2..id7 top to
 * bottom, matching `DEMO_UNREAD_IDS`.
 */
export function buildUnreadActivityNotifications(
  t: TFunction,
  fmt: Formatters,
): Notification[] {
  const meetingTime = new Date();
  meetingTime.setHours(19, 0, 0, 0);

  return [
    {
      // A forum @-mention (see list.4 copy / "Forum · Mention" meta), not a DM —
      // it was mislabeled `messages` before that category was retired.
      id: 4,
      type: "community",
      unread: true,
      avatar: { initials: "SA", tint: "jade" },
      actorSlug: "sofia",
      text: (
        <Translation
          i18nKey="notifications:list.4.text"
          components={{ strong: <strong /> }}
          values={{
            name: memberName("sofia"),
            quote: "What are we reading in July?",
          }}
        />
      ),
      meta: t("notifications:list.4.meta"),
      time: fmt.relativeTime(-3, "hour"),
      createdAtIso: agoIso(3, "hour"),
      actions: [
        {
          label: t("notifications:actions.viewThread"),
          variant: "primary",
          href: routes.forum,
        },
      ],
    },
    {
      id: 5,
      type: "platform",
      unread: true,
      icon: { Glyph: FiBookOpen, background: "rgba(var(--plum-rgb), .07)" },
      text: (
        <Translation
          i18nKey="notifications:list.5.text"
          components={{ strong: <strong /> }}
          values={{
            title: "QueerPulse Magazine Issue 18",
            cover: "The city changed. Did we?",
          }}
        />
      ),
      meta: t("notifications:list.5.meta"),
      time: fmt.relativeTime(-1, "day"),
      createdAtIso: agoIso(1, "day"),
      actions: [
        {
          label: t("notifications:actions.readNow"),
          variant: "primary",
          href: routes.magazine,
        },
      ],
    },
    {
      id: 6,
      type: "events",
      unread: true,
      icon: { Glyph: FiClock, background: "rgba(var(--jade-rgb), .1)" },
      text: (
        <Translation
          i18nKey="notifications:list.6.text"
          components={{ strong: <strong /> }}
          values={{
            group: "Theory Thursdays",
            when: fmt.relativeTime(1, "day"),
            time: fmt.time(meetingTime),
            spots: t("notifications:list.6.spots", { count: 1 }),
          }}
        />
      ),
      meta: t("notifications:list.6.meta"),
      time: fmt.relativeTime(-1, "day"),
      createdAtIso: agoIso(1, "day"),
      actions: [
        {
          label: t("notifications:actions.seeDetails"),
          variant: "ghost",
          href: routes.readingGroups,
        },
      ],
    },
    {
      id: 7,
      type: "community",
      unread: true,
      avatar: { initials: "MC", tint: "coral" },
      actorSlug: "mariana-costa",
      text: (
        <Translation
          i18nKey="notifications:list.7.text"
          components={{ strong: <strong /> }}
          values={{ name: "Mariana Costa" }}
        />
      ),
      meta: t("notifications:list.7.meta"),
      time: fmt.relativeTime(-2, "day"),
      createdAtIso: agoIso(2, "day"),
    },
  ];
}
