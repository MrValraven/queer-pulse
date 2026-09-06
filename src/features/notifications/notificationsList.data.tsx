import {
  FiAlertTriangle,
  FiArchive,
  FiAward,
  FiClipboard,
  FiHome,
  FiStar,
  FiTag,
  FiUserX,
} from "react-icons/fi";
import { communityPath, routes } from "../../app/routeMap";
import { memberName } from "../members/data/members";
import { Translation } from "../../shared/i18n/Translation";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { Notification } from "./notifications.types";
import { buildUnreadActivityNotifications } from "./notificationsListActivity.data";

/** Milliseconds in each unit the demo rows express their age in. */
const UNIT_MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
} as const;

/**
 * The ISO timestamp behind a demo row's relative `time` label, so the mock feed
 * carries the same `createdAtIso` the live adapter does and the page's day
 * headers bucket demo rows by real age too.
 */
function agoIso(amount: number, unit: keyof typeof UNIT_MS): string {
  return new Date(Date.now() - amount * UNIT_MS[unit]).toISOString();
}

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
 *
 * Ids 4, 5, 6, 7 live in `buildUnreadActivityNotifications`
 * (`notificationsListActivity.data.tsx`), split out to keep this function
 * under the per-function line limit. The two halves are spread together
 * below: ids 2, 3, 13, 14, 15, 16 here, then 4 through 7.
 */
function buildUnreadNotifications(
  t: TFunction,
  fmt: Formatters,
): Notification[] {
  const dinnerDate = new Date(2026, 5, 14);

  return [
    {
      id: 2,
      type: "events",
      unread: true,
      icon: { Glyph: FiTag, background: "rgba(var(--accent-rgb), .1)" },
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
      createdAtIso: agoIso(18, "minute"),
      actions: [
        {
          label: t("notifications:actions.viewEvent"),
          variant: "primary",
          href: routes.events,
        },
      ],
    },
    {
      id: 3,
      type: "community",
      unread: true,
      avatar: { initials: "DV", tint: "plum" },
      actorSlug: "diogo",
      text: (
        <Translation
          i18nKey="notifications:list.3.text"
          components={{ strong: <strong /> }}
          values={{ name: memberName("diogo"), group: "Queer Classics" }}
        />
      ),
      meta: t("notifications:list.3.meta"),
      time: fmt.relativeTime(-1, "hour"),
      createdAtIso: agoIso(1, "hour"),
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
          // Decline resolves the invite in place (see `resolve`) and never
          // navigates, but `NotifAction.href` is required — point it at the
          // real related page rather than a "#" placeholder so no dead-link
          // sentinel exists in the data even if `resolve` were ever dropped.
          label: t("notifications:actions.decline"),
          variant: "ghost",
          href: routes.readingGroups,
          resolve: { toast: t("notifications:list.3.declinedToast") },
        },
      ],
    },
    {
      // The demo counterpart of the live `subprofile_credit` row — the FIRST
      // notification kind with a real `.actions` CTA (see
      // `notifications.adapters.ts`). Mirrors the backend payload shape
      // (`subprofileName`/`itemTitle`/a deep link to the persona's page)
      // with flavour a real payload can't carry a display name for yet.
      id: 13,
      type: "community",
      unread: true,
      icon: { Glyph: FiAward, background: "rgba(var(--plum-rgb), .07)" },
      text: (
        <Translation
          i18nKey="notifications:list.13.text"
          components={{ strong: <strong /> }}
          values={{
            subprofileName: "Nightform",
            itemTitle: "Collab track: Static Bloom",
          }}
        />
      ),
      meta: t("notifications:list.13.meta"),
      time: fmt.relativeTime(-2, "hour"),
      createdAtIso: agoIso(2, "hour"),
      actions: [
        {
          label: t("notifications:actions.makePersona"),
          variant: "primary",
          href: `${routes.subprofilesDashboard}?create=1`,
        },
        {
          label: t("notifications:actions.seeTheWork"),
          variant: "ghost",
          href: "/p/nightform",
        },
      ],
    },
    {
      // The demo counterpart of the live `moderation_queue_alert` row (TS-04).
      // Staff-only in live mode, and the ONE kind whose copy lives outside the
      // `notifications:` namespace. The whole vocabulary is the queue-health
      // panel's, so this row reuses `admin:moderationHealth.*` verbatim rather
      // than minting demo-only strings. Icon and destination mirror
      // `notifications.adapters.ts`: amber triangle for `warning`, and the
      // console's health tab rather than the queue it summarises.
      id: 14,
      type: "platform",
      unread: true,
      icon: {
        Glyph: FiAlertTriangle,
        background: "rgba(var(--amber-rgb), .22)",
      },
      text: t("admin:moderationHealth.notification.warning.text", {
        count: 12,
        queue: t("admin:moderationHealth.queue.reports"),
        overdue: t("admin:moderationHealth.notification.overdueToken", {
          count: 3,
          value: fmt.number(3),
        }),
        oldest: t("admin:moderationHealth.notification.oldestToken", {
          count: 19,
          value: fmt.number(19),
        }),
      }),
      meta: t("admin:moderationHealth.notification.warning.meta"),
      time: fmt.relativeTime(-3, "hour"),
      createdAtIso: agoIso(3, "hour"),
      actions: [
        {
          label: t("notifications:actions.seeDetails"),
          variant: "ghost",
          href: `${routes.adminModeration}?tab=health`,
        },
      ],
    },
    {
      // The demo counterpart of the live `ban_evasion_escalation_raised` row
      // (PRD-31). Staff-only in live mode. Copy, icon and destination are the
      // live ones verbatim (`formatNotification` + `notifications.adapters`):
      // the person glyph on the ordinary platform ground, and the staff
      // escalations queue. The community name is an interpolation value, the
      // way every other proper noun in this file is.
      id: 15,
      type: "platform",
      unread: true,
      icon: { Glyph: FiUserX, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.ban_evasion_escalation_raised.text", {
        communityName: "Trans Hub",
      }),
      meta: t("notifications:type.ban_evasion_escalation_raised.meta"),
      time: fmt.relativeTime(-4, "hour"),
      createdAtIso: agoIso(4, "hour"),
      actions: [
        {
          label: t("notifications:actions.seeDetails"),
          variant: "ghost",
          href: routes.adminBanEvasion,
        },
      ],
    },
    {
      // The demo counterpart of the live `ban_evasion_escalation_resolved`
      // row (PRD-31), which reaches only the moderator who raised the
      // escalation. The action opens their own join queue, because the
      // decision on the request is still theirs, and the copy says so.
      id: 16,
      type: "platform",
      unread: true,
      icon: { Glyph: FiArchive, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.ban_evasion_escalation_resolved.text", {
        communityName: "Trans Hub",
      }),
      meta: t("notifications:type.ban_evasion_escalation_resolved.meta"),
      time: fmt.relativeTime(-5, "hour"),
      createdAtIso: agoIso(5, "hour"),
      actions: [
        {
          label: t("notifications:actions.openRequestsQueue"),
          variant: "ghost",
          href: `${communityPath("trans-hub")}?tab=modtools&mod=requests`,
        },
      ],
    },
    {
      // The demo counterpart of the live `persona_update` row (PRD-208), the
      // notification that makes following a persona mean something: before it,
      // a follow produced one notification to the persona's OWNER and the
      // FOLLOWER never heard from that persona again.
      //
      // It reuses the live `notifications:type.persona_update.*` keys rather
      // than minting demo-only strings, so the demo exercises the real CLDR
      // plural. `newItemCount` is what the live payload carries and
      // `formatNotification.ts` mirrors it onto `count`, so the count is
      // passed under BOTH names here for the same reason.
      //
      // NAMES THE PERSONA, NEVER ITS OWNER. A persona is pseudonymous: the
      // live payload deliberately carries no actor id, `persona_update` is
      // absent from `ACTOR_PAYLOAD_KEY`, and the push handler skips the actor
      // lookup. A demo row that showed a member name here would teach the
      // wrong shape to anyone reading this file for the payload.
      id: 17,
      type: "community",
      unread: true,
      icon: { Glyph: FiStar, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.persona_update.text", {
        subprofileName: "Nightform",
        newItemCount: 3,
        count: 3,
      }),
      meta: t("notifications:type.persona_update.meta"),
      time: fmt.relativeTime(-40, "minute"),
      createdAtIso: agoIso(40, "minute"),
      actions: [
        {
          label: t("notifications:actions.seeTheWork"),
          variant: "ghost",
          href: "/p/nightform",
        },
      ],
    },
    ...buildUnreadActivityNotifications(t, fmt),
  ];
}

function buildReadNotifications(t: TFunction, fmt: Formatters): Notification[] {
  const reportDate = new Date(2026, 5, 20);

  return [
    {
      id: 8,
      type: "platform",
      unread: false,
      icon: { Glyph: FiStar, background: "rgba(var(--accent-rgb), .09)" },
      text: (
        <Translation
          i18nKey="notifications:list.8.text"
          components={{ strong: <strong /> }}
          values={{ feature: "Barter Exchange" }}
        />
      ),
      meta: t("notifications:list.8.meta"),
      time: fmt.relativeTime(-3, "day"),
      createdAtIso: agoIso(3, "day"),
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
      icon: { Glyph: FiTag, background: "rgba(var(--accent-rgb), .1)" },
      text: (
        <Translation
          i18nKey="notifications:list.9.text"
          components={{ strong: <strong /> }}
          values={{
            event: "Queer Cinema Night: Levante",
            date: fmt.date(reportDate, { month: "long", day: "numeric" }),
          }}
        />
      ),
      meta: t("notifications:list.9.meta"),
      time: fmt.relativeTime(-4, "day"),
      createdAtIso: agoIso(4, "day"),
      actions: [
        {
          label: t("notifications:actions.viewEvent"),
          variant: "ghost",
          href: routes.events,
        },
      ],
    },
    {
      id: 11,
      type: "community",
      unread: false,
      icon: { Glyph: FiClipboard, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:list.11.text", {
        count: 12,
        postTitle: "Housing law update: what I found out",
      }),
      meta: t("notifications:list.11.meta"),
      time: fmt.relativeTime(-6, "day"),
      createdAtIso: agoIso(6, "day"),
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
      icon: { Glyph: FiHome, background: "rgba(var(--plum-rgb), .07)" },
      text: (
        <Translation
          i18nKey="notifications:list.12.text"
          components={{ strong: <strong /> }}
          values={{ report: "Q2 2026 Community Health Report" }}
        />
      ),
      meta: t("notifications:list.12.meta"),
      time: fmt.relativeTime(-1, "week"),
      createdAtIso: agoIso(1, "week"),
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

/**
 * Composes the demo feed from its two order-preserving sections — the unread
 * rows (ids 2-7, 13, 14, 15, 16) followed by the already-read rows (ids 8, 9,
 * 11, 12). Splitting the builder by read-state keeps each section small. (Ids 1 and 10
 * were private-message rows, removed when the "messages" category was retired.)
 */
export function buildNotifications(
  t: TFunction,
  fmt: Formatters,
): Notification[] {
  return [
    ...buildUnreadNotifications(t, fmt),
    ...buildReadNotifications(t, fmt),
  ];
}

/** Ids of demo rows that start unread — used for the bell badge count without
 * needing `t`/`fmt` (the count only depends on the `unread` flag, not copy). */
export const DEMO_UNREAD_IDS = [2, 3, 13, 14, 15, 16, 4, 5, 6, 7];
