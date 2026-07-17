import {
  FiBookOpen,
  FiClipboard,
  FiClock,
  FiHome,
  FiStar,
  FiTag,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { memberName } from "../members/data/members";
import { Translation } from "../../shared/i18n/Translation";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { Notification } from "./notifications.types";

/**
 * Demo notification feed. Mirrors, per row, what the live `formatNotification`
 * adapter renders for the analogous backend `type` — but with richer flavour
 * detail a real payload doesn't (yet) carry names for. Proper nouns
 * (event/community/feature names, quoted post titles) are interpolation
 * values, never translated — see the i18n sweep scope rule.
 *
 * A function of `t` + `fmt` (Pattern B): several rows carry a `<strong>` run
 * around an interpolated name/title, and the relative "time ago" labels are
 * computed through `fmt.relativeTime`/`fmt.date` rather than hand-rolled.
 */
export function buildNotifications(
  t: TFunction,
  fmt: Formatters,
): Notification[] {
  const dinnerDate = new Date(2026, 5, 14);
  const reportDate = new Date(2026, 5, 20);
  const meetingTime = new Date();
  meetingTime.setHours(19, 0, 0, 0);

  return [
    {
      id: 1,
      type: "messages",
      unread: true,
      avatar: { initials: "IT", tint: "jade" },
      text: (
        <Translation
          i18nKey="notifications:list.1.text"
          components={{ strong: <strong /> }}
          values={{ name: memberName("ines") }}
        />
      ),
      meta: t("notifications:list.1.meta"),
      time: fmt.relativeTime(-2, "minute"),
      actions: [
        {
          label: t("notifications:actions.reply"),
          variant: "primary",
          href: routes.messages,
        },
        {
          label: t("notifications:actions.viewThread"),
          variant: "ghost",
          href: routes.messages,
        },
      ],
    },
    {
      id: 2,
      type: "events",
      unread: true,
      icon: { Glyph: FiTag, bg: "rgba(232,119,90,.1)" },
      text: (
        <Translation
          i18nKey="notifications:list.2.text"
          components={{ strong: <strong /> }}
          values={{
            title: "Newcomer Welcome Dinner",
            date: fmt.date(dinnerDate, {
              weekday: "long",
              month: "long",
              day: "numeric",
            }),
            venue: "Casa do Alentejo",
          }}
        />
      ),
      meta: t("notifications:list.2.meta"),
      time: fmt.relativeTime(-18, "minute"),
      actions: [
        {
          label: t("notifications:actions.viewEvent"),
          variant: "primary",
          href: routes.event,
        },
      ],
    },
    {
      id: 3,
      type: "community",
      unread: true,
      avatar: { initials: "DV", tint: "plum" },
      text: (
        <Translation
          i18nKey="notifications:list.3.text"
          components={{ strong: <strong /> }}
          values={{ name: memberName("diogo"), group: "Queer Classics" }}
        />
      ),
      meta: t("notifications:list.3.meta"),
      time: fmt.relativeTime(-1, "hour"),
      actions: [
        {
          label: t("notifications:actions.accept"),
          variant: "primary",
          href: routes.readingGroups,
          resolve: {
            toast: t("notifications:list.3.joinedToast", {
              group: "Queer Classics",
            }),
          },
        },
        {
          label: t("notifications:actions.decline"),
          variant: "ghost",
          href: "#",
          resolve: { toast: t("notifications:list.3.declinedToast") },
        },
      ],
    },
    {
      id: 4,
      type: "messages",
      unread: true,
      avatar: { initials: "SA", tint: "jade" },
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
      icon: { Glyph: FiBookOpen, bg: "rgba(45,27,61,.07)" },
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
      icon: { Glyph: FiClock, bg: "rgba(74,140,111,.1)" },
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
      text: (
        <Translation
          i18nKey="notifications:list.7.text"
          components={{ strong: <strong /> }}
          values={{ name: "Mariana Costa" }}
        />
      ),
      meta: t("notifications:list.7.meta"),
      time: fmt.relativeTime(-2, "day"),
    },
    {
      id: 8,
      type: "platform",
      unread: false,
      icon: { Glyph: FiStar, bg: "rgba(232,119,90,.09)" },
      text: (
        <Translation
          i18nKey="notifications:list.8.text"
          components={{ strong: <strong /> }}
          values={{ feature: "Barter Exchange" }}
        />
      ),
      meta: t("notifications:list.8.meta"),
      time: fmt.relativeTime(-3, "day"),
      actions: [
        {
          label: t("notifications:actions.seeBarterBoard"),
          variant: "ghost",
          href: routes.barter,
        },
      ],
    },
    {
      id: 9,
      type: "events",
      unread: false,
      icon: { Glyph: FiTag, bg: "rgba(232,119,90,.1)" },
      text: (
        <Translation
          i18nKey="notifications:list.9.text"
          components={{ strong: <strong /> }}
          values={{
            event: "Queer Cinema Night — Levante",
            date: fmt.date(reportDate, { month: "long", day: "numeric" }),
          }}
        />
      ),
      meta: t("notifications:list.9.meta"),
      time: fmt.relativeTime(-4, "day"),
      actions: [
        {
          label: t("notifications:actions.viewEvent"),
          variant: "ghost",
          href: routes.event,
        },
      ],
    },
    {
      id: 10,
      type: "messages",
      unread: false,
      avatar: { initials: "RF", tint: "jade" },
      text: (
        <Translation
          i18nKey="notifications:list.10.text"
          components={{ strong: <strong /> }}
          values={{
            name: "Rui Fernandes",
            event: "Archive Night",
            day: fmt.date(new Date(2026, 5, 19), { weekday: "long" }),
          }}
        />
      ),
      meta: t("notifications:list.10.meta"),
      time: fmt.relativeTime(-5, "day"),
      actions: [
        {
          label: t("notifications:actions.readMessage"),
          variant: "ghost",
          href: routes.messages,
        },
      ],
    },
    {
      id: 11,
      type: "community",
      unread: false,
      icon: { Glyph: FiClipboard, bg: "rgba(45,27,61,.07)" },
      text: t("notifications:list.11.text", {
        count: 12,
        postTitle: "Housing law update — what I found out",
      }),
      meta: t("notifications:list.11.meta"),
      time: fmt.relativeTime(-6, "day"),
      actions: [
        {
          label: t("notifications:actions.viewReplies"),
          variant: "ghost",
          href: routes.forum,
        },
      ],
    },
    {
      id: 12,
      type: "platform",
      unread: false,
      icon: { Glyph: FiHome, bg: "rgba(45,27,61,.07)" },
      text: (
        <Translation
          i18nKey="notifications:list.12.text"
          components={{ strong: <strong /> }}
          values={{ report: "Q2 2026 Community Health Report" }}
        />
      ),
      meta: t("notifications:list.12.meta"),
      time: fmt.relativeTime(-1, "week"),
      actions: [
        {
          label: t("notifications:actions.readReport"),
          variant: "ghost",
          href: routes.governance,
        },
      ],
    },
  ];
}

/** Ids of demo rows that start unread — used for the bell badge count without
 * needing `t`/`fmt` (the count only depends on the `unread` flag, not copy). */
export const DEMO_UNREAD_IDS = [1, 2, 3, 4, 5, 6, 7];
