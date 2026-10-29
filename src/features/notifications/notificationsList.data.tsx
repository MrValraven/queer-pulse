import {
  FiAlertTriangle,
  FiArchive,
  FiAward,
  FiClipboard,
  FiFlag,
  FiHome,
  FiMessageSquare,
  FiMic,
  FiMusic,
  FiRadio,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiUserX,
} from "react-icons/fi";
import { communityPath, routes } from "../../app/routeMap";
import { memberName } from "../members/data/members";
import { DEMO_ARTIST_MARIANA } from "../studio/api/studioDemoMe.data";
import {
  studioDashboardPath,
  studioPaymentsPath,
  studioPlaylistPath,
} from "../studio/studioPaths";
import { Translation } from "../../shared/i18n/Translation";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { buildListingTeamNotifications } from "./listingTeamNotifications.data";
import type { Notification } from "./notifications.types";
import {
  buildUnreadActivityNotifications,
  type DemoNotificationRow,
} from "./notificationsListActivity.data";

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
 * Ids 4, 5, 6, 7, 18 live in `buildUnreadActivityNotifications`
 * (`notificationsListActivity.data.tsx`), split out to keep this function
 * under the per-function line limit. The two halves are spread together
 * below: ids 2, 3, 13, 14, 15, 16 here, then 4, 5, 6, 7, 18.
 */
function buildUnreadNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
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
    buildStudioReleaseNotification(t, fmt),
    buildStudioEpisodeNotification(t, fmt),
    buildPersonaPostNotification(t, fmt),
    ...buildStudioMemberNotifications(t, fmt),
    ...buildUnreadActivityNotifications(t, fmt),
  ];
}

function buildStudioReleaseNotification(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow {
  return {
    // The demo counterpart of the live `studio_release_published` row
    // (Studio v2). It reuses the live keys and names the persona only.
    id: 19,
    type: "community",
    unread: true,
    icon: { Glyph: FiMusic, background: "rgba(var(--plum-rgb), .07)" },
    text: t("notifications:type.studio_release_published.text", {
      subprofileName: "Mariana Sol",
      releaseTitle: "Cidade dos santos",
      count: 1,
    }),
    meta: t("notifications:type.studio_release_published.meta"),
    time: fmt.relativeTime(-2, "hour"),
    createdAtIso: agoIso(2, "hour"),
    actions: [
      {
        label: t("notifications:actions.listenNow"),
        variant: "ghost",
        href: "/studio/album?id=demo-release-cidade-dos-santos",
      },
    ],
  };
}

function buildStudioEpisodeNotification(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow {
  return {
    // The demo counterpart of the live `studio_episode_published` row
    // (Studio artist kinds). It reuses the live keys and names the persona
    // only.
    id: 25,
    type: "community",
    unread: true,
    icon: { Glyph: FiMic, background: "rgba(var(--plum-rgb), .07)" },
    text: t("notifications:type.studio_episode_published.text", {
      subprofileName: "Late Bloomers",
      trackTitle: "Chosen family dinners",
      releaseTitle: "Late Bloomers",
      count: 1,
    }),
    meta: t("notifications:type.studio_episode_published.meta"),
    time: fmt.relativeTime(-1, "day"),
    createdAtIso: agoIso(1, "day"),
    actions: [
      {
        label: t("notifications:actions.listenNow"),
        variant: "ghost",
        href: "/studio/track?id=demo-episode-late-bloomers-03",
      },
    ],
  };
}

function buildPersonaPostNotification(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow {
  return {
    // The demo counterpart of the live `persona_post` row (Studio v3).
    id: 24,
    type: "community",
    unread: true,
    icon: { Glyph: FiMessageSquare, background: "rgba(var(--plum-rgb), .07)" },
    text: t("notifications:type.persona_post.text", {
      subprofileName: "NIGHTFORM",
      excerpt: "new single in nine days, Night bus, the long version",
      count: 1,
    }),
    meta: t("notifications:type.persona_post.meta"),
    time: fmt.relativeTime(-5, "hour"),
    createdAtIso: agoIso(5, "hour"),
    actions: [
      {
        label: t("notifications:actions.readUpdate"),
        variant: "ghost",
        href: "/p/nightform#updates",
      },
    ],
  };
}

/** The Studio rows a persona member sees: credits, then purchases. */
function buildStudioMemberNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  return [
    ...buildStudioCreditNotifications(t, fmt),
    ...buildStudioLandingNotifications(t, fmt),
    ...buildStudioPurchaseNotifications(t, fmt),
  ];
}

function buildStudioLandingNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  // The demo counterparts of the live landing rows. They reuse the live keys
  // and name personas and tracks only.
  return [
    {
      id: 36,
      type: "community",
      unread: true,
      icon: { Glyph: FiRadio, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_landing_preview_requested.text", {
        personaName: DEMO_ARTIST_MARIANA.name,
        trackTitle: "Planície",
        count: 1,
      }),
      meta: t("notifications:type.studio_landing_preview_requested.meta"),
      time: fmt.relativeTime(-3, "hour"),
      createdAtIso: agoIso(3, "hour"),
      actions: [
        {
          label: t("notifications:actions.answerLandingPreview"),
          variant: "ghost",
          href: `${studioDashboardPath(DEMO_ARTIST_MARIANA.id)}#landing-previews`,
        },
      ],
    },
    {
      id: 37,
      type: "platform",
      unread: false,
      icon: { Glyph: FiMusic, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_access_granted.text"),
      meta: t("notifications:type.studio_access_granted.meta"),
      time: fmt.relativeTime(-5, "day"),
      createdAtIso: agoIso(5, "day"),
      shouldRefreshStudioAccess: true,
      actions: [
        {
          label: t("notifications:actions.openStudio"),
          variant: "ghost",
          href: routes.studio,
        },
      ],
    },
  ];
}

function buildStudioPurchaseNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  // The demo counterparts of the live purchase rows. They reuse the live
  // keys and name artists and items only; no buyer and no amount.
  return [
    {
      id: 34,
      type: "community",
      unread: true,
      icon: { Glyph: FiShoppingBag, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_purchase_claimed.text", {
        artistName: "Mariana Sol",
        itemTitle: "Cidade dos santos",
        count: 1,
      }),
      meta: t("notifications:type.studio_purchase_claimed.meta"),
      time: fmt.relativeTime(-2, "hour"),
      createdAtIso: agoIso(2, "hour"),
      actions: [
        {
          label: t("notifications:actions.reviewPayments"),
          variant: "ghost",
          href: studioPaymentsPath(DEMO_ARTIST_MARIANA.id),
        },
      ],
    },
    {
      id: 35,
      type: "community",
      unread: false,
      icon: { Glyph: FiShoppingBag, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_purchase_confirmed.text", {
        artistName: "Coro de Outubro",
        itemTitle: "Salmos de rua",
      }),
      meta: t("notifications:type.studio_purchase_confirmed.meta"),
      time: fmt.relativeTime(-4, "day"),
      createdAtIso: agoIso(4, "day"),
      actions: [
        {
          label: t("notifications:actions.openPurchases"),
          variant: "ghost",
          href: routes.musicPurchases,
        },
      ],
    },
  ];
}

function buildStudioCreditNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  // The demo counterparts of the live credit rows. They reuse the live keys
  // and name personas only.
  return [
    {
      id: 22,
      type: "community",
      unread: true,
      icon: { Glyph: FiAward, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_credit_requested.text", {
        requestingPersonaName: "LeChatDashinko",
        creditedPersonaName: "Mariana Sol",
        trackTitle: "Bicha, with love",
        role: t("notifications:studioCreditRole.featured"),
        count: 1,
      }),
      meta: t("notifications:type.studio_credit_requested.meta"),
      time: fmt.relativeTime(-1, "day"),
      createdAtIso: agoIso(1, "day"),
      actions: [
        {
          label: t("notifications:actions.reviewCredit"),
          variant: "ghost",
          href: routes.studioCredits,
        },
      ],
    },
    {
      id: 23,
      type: "community",
      unread: false,
      icon: { Glyph: FiAward, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_credit_accepted.text", {
        creditedPersonaName: "NIGHTFORM",
        trackTitle: "Carta para a santa",
        role: t("notifications:studioCreditRole.producer"),
      }),
      meta: t("notifications:type.studio_credit_accepted.meta"),
      time: fmt.relativeTime(-3, "day"),
      createdAtIso: agoIso(3, "day"),
    },
  ];
}

/** One demo collaborative playlist row, named the way the live adapter names
 *  it: the counterpart member as a profile link through `actor`, the playlist
 *  from the payload. It opens the demo playlist it is about
 *  (studioCollection.data.ts). */
function studioPlaylistEditorRow(
  t: TFunction,
  fmt: Formatters,
  row: {
    id: number;
    kind: string;
    isUnread: boolean;
    memberSlug: string;
    initials: string;
    playlistId: string;
    textValues: Record<string, string>;
    age: { amount: number; unit: keyof typeof UNIT_MS };
  },
): DemoNotificationRow {
  return {
    id: row.id,
    type: "community",
    unread: row.isUnread,
    avatar: { initials: row.initials, tint: "plum" },
    actorSlug: row.memberSlug,
    actor: {
      name: memberName(row.memberSlug),
      href: `${routes.members}/${row.memberSlug}`,
      textKey: `notifications:type.${row.kind}.textNamed`,
      textValues: row.textValues,
    },
    text: t(`notifications:type.${row.kind}.text`, row.textValues),
    meta: t(`notifications:type.${row.kind}.meta`),
    time: fmt.relativeTime(-row.age.amount, row.age.unit),
    createdAtIso: agoIso(row.age.amount, row.age.unit),
    sourceHref: studioPlaylistPath(row.playlistId),
  };
}

/** The unread demo counterparts of the live collaborative playlist rows
 *  (ids 26 and 29). */
function buildUnreadStudioPlaylistEditorNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  return [
    studioPlaylistEditorRow(t, fmt, {
      id: 26,
      kind: "studio_playlist_editor_invite",
      isUnread: true,
      memberSlug: "catarina-vaz",
      initials: "CV",
      playlistId: "demo-playlist-pride-warm-up",
      textValues: { playlistName: "Pride warm-up" },
      age: { amount: 2, unit: "hour" },
    }),
    studioPlaylistEditorRow(t, fmt, {
      id: 29,
      kind: "studio_playlist_editor_added",
      isUnread: true,
      memberSlug: "rita",
      initials: "RV",
      playlistId: "demo-playlist-tour-diary",
      textValues: { playlistName: "Tour diary", personaName: "Mariana Sol" },
      age: { amount: 1, unit: "day" },
    }),
  ];
}

/** The already-read demo counterparts (ids 27 and 28): an invitee's answers. */
function buildReadStudioPlaylistEditorNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  return [
    studioPlaylistEditorRow(t, fmt, {
      id: 27,
      kind: "studio_playlist_editor_invite_accepted",
      isUnread: false,
      memberSlug: "jonas",
      initials: "JF",
      playlistId: "demo-playlist-for-the-group-chat",
      textValues: { playlistName: "For the group chat" },
      age: { amount: 3, unit: "day" },
    }),
    studioPlaylistEditorRow(t, fmt, {
      id: 28,
      kind: "studio_playlist_editor_invite_declined",
      isUnread: false,
      memberSlug: "sofia-castano",
      initials: "SC",
      playlistId: "demo-playlist-for-the-group-chat",
      textValues: { playlistName: "For the group chat" },
      age: { amount: 4, unit: "day" },
    }),
  ];
}

/** The demo counterparts of the live Studio takedown notices. They reuse the
 *  live keys and open the demo owner's taken-down release, where the
 *  dispute panel is. */
function buildStudioOwnerNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  const releaseHref = "/studio/album?id=demo-release-taken-down-bairro";
  return [
    {
      id: 30,
      type: "platform",
      unread: true,
      icon: { Glyph: FiShield, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_copyright_claim_accepted.text", {
        trackTitle: "Vela acesa",
      }),
      meta: t("notifications:type.studio_copyright_claim_accepted.meta"),
      time: fmt.relativeTime(-4, "day"),
      createdAtIso: agoIso(4, "day"),
      sourceHref: "/studio/track?id=demo-track-mariana-3-02",
    },
    {
      id: 31,
      type: "platform",
      unread: false,
      icon: { Glyph: FiShield, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_track_marked.explicit.text", {
        trackTitle: "A Beja",
      }),
      meta: t("notifications:type.studio_track_marked.explicit.meta"),
      time: fmt.relativeTime(-5, "day"),
      createdAtIso: agoIso(5, "day"),
      sourceHref: "/studio/track?id=demo-track-mariana-2-02",
    },
    {
      id: 21,
      type: "platform",
      unread: false,
      icon: {
        Glyph: FiMessageSquare,
        background: "rgba(var(--plum-rgb), .07)",
      },
      text: t("notifications:type.studio_release_dispute_decided.text", {
        releaseTitle: "Bairro antigo",
      }),
      meta: t("notifications:type.studio_release_dispute_decided.meta"),
      time: fmt.relativeTime(-2, "day"),
      createdAtIso: agoIso(2, "day"),
      sourceHref: releaseHref,
    },
    {
      id: 20,
      type: "platform",
      unread: false,
      icon: { Glyph: FiFlag, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.studio_release_taken_down.text", {
        releaseTitle: "Bairro antigo",
      }),
      meta: t("notifications:type.studio_release_taken_down.meta"),
      time: fmt.relativeTime(-3, "day"),
      createdAtIso: agoIso(3, "day"),
      sourceHref: releaseHref,
    },
  ];
}

function buildReadNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
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
 * Composes the demo feed from its builders, in this order: the unread rows
 * (ids 2-7, 13, 14, 15, 16, 18), the unread collaborative playlist rows (ids
 * 26 and 29), the Studio owner notices, the read collaborative playlist rows
 * (ids 27 and 28), then the already-read rows (ids 8, 9, 11, 12, 20, 21).
 * Splitting the builders by read-state keeps each one small.
 * (Ids 1 and 10 were private-message rows, removed when the "messages"
 * category was retired.) Every row starts in the bell; `useNotifications`
 * flags the rows hidden from it this session.
 */
export function buildNotifications(
  t: TFunction,
  fmt: Formatters,
): Notification[] {
  return [
    ...buildUnreadNotifications(t, fmt),
    ...buildUnreadStudioPlaylistEditorNotifications(t, fmt),
    ...buildListingTeamNotifications(t, fmt),
    ...buildStudioOwnerNotifications(t, fmt),
    ...buildReadStudioPlaylistEditorNotifications(t, fmt),
    ...buildReadNotifications(t, fmt),
  ].map((row) => ({ ...row, isHiddenFromBell: false }));
}

/** Ids of demo rows that start unread — used for the bell badge count without
 * needing `t`/`fmt` (the count only depends on the `unread` flag, not copy). */
export const DEMO_UNREAD_IDS = [
  2, 3, 13, 14, 15, 16, 4, 5, 6, 7, 18, 26, 29, 32,
];
