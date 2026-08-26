import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiFlag,
  FiInbox,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import {
  businessPath,
  communityPath,
  routes,
  thread,
} from "../../../app/routeMap";
import { coHostInvitePath, gatheringPath } from "../../gatherings/data";
import { communityPostPath } from "../../communities/communityPostPath";
import { barterProposalsPath } from "../../economy/barterProposals.paths";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";
import type { Notification, NotifType } from "../notifications.types";
import {
  formatNotification,
  type NotificationKind,
} from "./formatNotification";
import type {
  NotificationActorDTO,
  NotificationDTO,
} from "./notifications.api";

/** Each notification kind → the icon its row renders with (no avatar from the API). */
const KIND_ICONS: Record<NotifType, IconType> = {
  events: FiCalendar,
  community: FiUsers,
  platform: FiBell,
};

/** Subtle tinted background behind each kind's icon, matching the mock palette. */
const KIND_ICON_BACKGROUND: Record<NotifType, string> = {
  events: "rgba(var(--accent-rgb), .1)",
  community: "rgba(var(--plum-rgb), .07)",
  platform: "rgba(var(--plum-rgb), .07)",
};

/**
 * The icon a newly-filed report renders with, or `undefined` for every other
 * kind. This is the ONE place a row overrides the three-icon category map
 * above, and it earns it: a moderator's bell is otherwise a wall of identical
 * platform bells, and an emergency report (outing or doxxing, the two reasons
 * carrying a 1-hour SLA) has to be pickable out of that wall at a glance.
 *
 * Emergency gets a warning triangle on a coral wash; every other severity gets
 * a flag on the ordinary platform ground, so the emphasis stays meaningful
 * instead of shouting on every report.
 */
/**
 * The icon an account/security row renders with, or `undefined` for every other
 * kind. The second and last override of the three-icon category map, on the
 * same reasoning as `reportIconFor`: a member scanning a wall of identical
 * platform bells has to be able to pick out the one telling them their account
 * was signed in to somewhere they do not recognise.
 *
 * A shield, not a warning triangle. The row is not an accusation — most new
 * sign-ins are the member buying a laptop — and dressing it as an alarm every
 * time is how a real one stops being noticed.
 */
function securityIconFor(
  kind: NotificationKind | null,
): { Glyph: IconType; background: string } | undefined {
  if (
    kind !== "security_new_sign_in" &&
    kind !== "account_export_ready" &&
    kind !== "account_deletion_final_warning" &&
    kind !== "dsar_resolved"
  ) {
    return undefined;
  }
  return { Glyph: FiShield, background: KIND_ICON_BACKGROUND.platform };
}

/**
 * The icon a reviewed intake submission renders with, or `undefined` for every
 * other kind. An inbox tray, deliberately not the shield above: the member sent
 * something in and it came back with an answer, which is a different feeling
 * from anything about their account's safety. Keeping the two apart is what
 * stops the shield from becoming the generic "platform" glyph it would be if
 * every system row borrowed it.
 */
function intakeIconFor(
  kind: NotificationKind | null,
): { Glyph: IconType; background: string } | undefined {
  if (kind !== "intake_reviewed") return undefined;
  return { Glyph: FiInbox, background: KIND_ICON_BACKGROUND.platform };
}

function reportIconFor(
  kind: NotificationKind | null,
  payload: Record<string, unknown> | null | undefined,
): { Glyph: IconType; background: string } | undefined {
  if (kind !== "report_filed" && kind !== "community_report_filed") {
    return undefined;
  }
  const isEmergency = payload?.severity === "emergency";
  return isEmergency
    ? { Glyph: FiAlertTriangle, background: "rgba(var(--accent-rgb), .18)" }
    : { Glyph: FiFlag, background: KIND_ICON_BACKGROUND.platform };
}

/**
 * The icon a TS-04 queue-health alert renders with, or `undefined` for every
 * other kind. The fourth and last override of the three-icon category map.
 *
 * The glyph tracks the payload's severity, so the row carries the level in a
 * second channel beside its words: a recovery notice and an emergency must not
 * look alike in a list being scanned. An unrecognised level falls to the
 * neutral activity glyph rather than claiming either extreme.
 */
function moderationQueueAlertIconFor(
  kind: NotificationKind | null,
  payload: Record<string, unknown> | null | undefined,
): { Glyph: IconType; background: string } | undefined {
  if (kind !== "moderation_queue_alert") return undefined;
  const severity = payload?.severity;
  if (severity === "critical") {
    return {
      Glyph: FiAlertOctagon,
      background: "rgba(var(--danger-rgb), .18)",
    };
  }
  if (severity === "warning") {
    return {
      Glyph: FiAlertTriangle,
      background: "rgba(var(--amber-rgb), .22)",
    };
  }
  if (severity === "ok") {
    return { Glyph: FiCheckCircle, background: "rgba(var(--jade-rgb), .18)" };
  }
  return { Glyph: FiActivity, background: KIND_ICON_BACKGROUND.platform };
}

/**
 * Map a backend notification to the prototype's rich Notification view-model,
 * defaulting the prototype-only fields (avatars, action buttons) gracefully.
 *
 * The API serves no display text — only `type` + structured `payload` — so the
 * row's text and sub-line are rendered here through i18n, in the caller's
 * active language. Interactive actions stay a mock-only affordance for now.
 */
/**
 * Kinds that carry a personalized `type.<kind>.textNamed` string (a
 * `<profile>{name}</profile>` slot). Mirrors the backend types that resolve an
 * `actor`; a kind absent here still shows the actor's avatar + link but keeps
 * its generic copy rather than a missing i18n key.
 */
const PERSONALIZED_KINDS = new Set<NotificationKind>([
  "connection_request",
  "connection_accepted",
  "vouch_received",
  "introduction_made",
  "event_invite",
  "event_cohost_invite",
  "mention",
  "forum_reply",
  // Coverage-sweep kinds that carry a member actor (and so a `textNamed`
  // variant). The system-driven ones (join_request_approved/declined,
  // listing_approved, report_resolved, appeal_resolved, roadmap_status) resolve
  // no actor and keep their generic `.text`.
  "event_rsvp",
  "community_reply",
  "forum_thread_reply",
  // A topic-new-post row always carries the posting member as an actor
  // (`payload.actorId`, written by `TopicFollowNotificationsListener`).
  "topic_new_post",
  "join_request_received",
  "job_application",
  "invite_accepted",
  "listing_review",
  // A named safe-space vouch resolves the voucher as the actor; an anonymous one
  // carries no `voucherId`, so `dto.actor` is null and the generic `.text` shows.
  "safe_space_vouch",
  // A swap proposal always carries the proposer as its actor, resolved
  // server-side into the standard `actor` field.
  "barter_proposal_received",
]);

export function notificationDtoToView(
  dto: NotificationDTO,
  t: TFunction,
  fmt: Formatters,
): Notification {
  const { text, meta, category, kind } = formatNotification(
    dto.type,
    dto.payload,
    t,
    // `security_new_sign_in` prints the wall-clock time of the sign-in in the
    // member's own language; every other kind ignores this argument.
    fmt,
  );
  const view: Notification = {
    // Backend ids are uuids — pass through as-is. Coercing with Number() would
    // yield NaN for every row (duplicate React keys, un-markable rows).
    id: dto.id,
    type: category,
    // The backend sends `read`; the view-model is phrased the other way round.
    // Missing/!boolean degrades to unread so a row is never silently swallowed.
    unread: dto.read !== true,
    icon: {
      Glyph: KIND_ICONS[category] ?? FiBell,
      background: KIND_ICON_BACKGROUND[category],
    },
    text,
    meta,
    time: formatTime(dto.createdAt, fmt),
    createdAtIso: dto.createdAt,
  };

  // When the backend resolved the acting member, upgrade the row from an
  // anonymous icon + "someone …" to their avatar, name, and a profile link.
  if (dto.actor) {
    const name = actorName(dto.actor);
    const href = `${routes.members}/${dto.actor.slug}`;
    // `mention` rows branch their copy by `payload.entityKind` (who/what was
    // actually @-mentioned — member/community/business/event/thread). No
    // `entityKind` (older rows) or `entityKind === "member"` keeps the flat
    // `mention.textNamed` key; every other kind, mirrors
    // `formatNotification`'s `mentionKeyFor`.
    const entityKind = (dto.payload as { entityKind?: string } | null)
      ?.entityKind;
    const namedKey =
      kind === "mention" && entityKind && entityKind !== "member"
        ? `mention.${entityKind}`
        : kind;
    view.actorSlug = dto.actor.slug;
    view.actor = {
      name,
      href,
      textKey:
        kind && PERSONALIZED_KINDS.has(kind)
          ? `notifications:type.${namedKey}.textNamed`
          : undefined,
    };
    view.avatar = {
      initials: actorInitials(dto.actor),
      tint: tintForSlug(dto.actor.slug),
      src: dto.actor.avatarUrl ?? undefined,
    };
    // The icon is the fallback for actor-less rows; drop it so the avatar shows.
    view.icon = undefined;
  }

  view.sourceHref = sourceHrefFromPayload(dto.type, dto.payload);

  // A report row keeps its icon even though it resolves no actor (it never
  // names the reporter), so the override is applied last, after the actor
  // branch above would have cleared `icon` for an actor-bearing row.
  const reportIcon = reportIconFor(kind, dto.payload);
  if (reportIcon) view.icon = reportIcon;

  // Same placement, same reason: an account/security row resolves no actor, so
  // the actor branch above never cleared its icon, but the override still has
  // to come after it to be the last word on which glyph wins.
  const securityIcon = securityIconFor(kind);
  if (securityIcon) view.icon = securityIcon;

  // Same placement, same reason as the two overrides above: an intake outcome
  // resolves no actor, and this has to be the last word on its glyph.
  const intakeIcon = intakeIconFor(kind);
  if (intakeIcon) view.icon = intakeIcon;

  // Same placement, same reason as the three overrides above: a queue-health
  // alert has no actor by design (it is duty mail about the state of the work,
  // and an actor would run the recipients' own block and mute lists over an
  // operational alert), so this has to be the last word on its glyph.
  const queueHealthIcon = moderationQueueAlertIconFor(kind, dto.payload);
  if (queueHealthIcon) view.icon = queueHealthIcon;

  // `subprofile_credit` (Personas discovery Phase 5, Decision §3): the FIRST
  // live notification kind to populate `.actions` — every other kind above
  // leaves it `undefined`, which `NotificationItem` already renders fine
  // (its `{notification.actions && …}` guard has no demo-only condition, it
  // was simply never given a live value before this). The deep link comes
  // straight from `payload.deepLink` (the persona's own page, resolved
  // server-side); a missing/malformed one just drops the second action
  // rather than risk a broken href.
  if (dto.type === "subprofile_credit") {
    const deepLink = (dto.payload as { deepLink?: unknown } | null)?.deepLink;
    view.actions = [
      {
        label: t("notifications:actions.makePersona"),
        variant: "primary",
        href: `${routes.subprofilesDashboard}?create=1`,
      },
      ...(typeof deepLink === "string" && deepLink
        ? [
            {
              label: t("notifications:actions.seeTheWork"),
              variant: "ghost" as const,
              href: deepLink,
            },
          ]
        : []),
    ];
  }

  return view;
}

/**
 * Deep-link to the thread/discussion a notification originated from, built
 * from `payload.source` + its slug field: `thread(threadSlug)` for a forum
 * mention, and for a community one the POST'S OWN PERMALINK,
 * `communityPostPath(communitySlug, postId)` (SOC-02). `payload` is
 * `Record<string, unknown>` (server-trusted but untyped on this side), so
 * every field is read defensively.
 *
 * "Ana replied to your post" used to resolve to `communityPath(communitySlug)`
 * and throw `postId` away, which dropped the member at the top of a paginated
 * timeline to hunt for the post they had just been told about. `postId` was
 * already in the payload for both the nested and the flat write paths; this
 * simply stops discarding it. A community row with no `postId` still falls
 * back to the community page, which is the honest destination for a
 * notification about the community itself.
 *
 * Returns `undefined` — never a broken link — whenever the needed slug is
 * missing. A genuinely global post (`createFlatPost` with no `communitySlug`,
 * reachable only by calling the API directly) has no community to be read
 * inside and therefore no page to open, so those rows still get no source
 * href; the row itself still reads and still links the actor.
 */
function sourceHrefFromPayload(
  type: string,
  payload: Record<string, unknown> | null | undefined,
): string | undefined {
  // A newly-filed report is the one kind whose destination is a QUEUE rather
  // than the thing that was reported: the responder needs the surface where
  // they can act, and the reported content is one click from there. Platform
  // staff go to the moderation queue; a community's staff go to their own mod
  // tools with the reports pane already open. Keyed on `type` rather than on a
  // payload `source` field precisely because neither destination is the
  // community/thread page a `source` value would resolve to.
  if (type === "report_filed") return routes.adminModeration;
  // TS-04. `payload.source` is `"moderation"`, and the destination is the
  // console's own queue-health tab: the alert is about the state of the work,
  // so it opens the reading rather than one of the queues it summarises.
  if (type === "moderation_queue_alert") {
    return `${routes.adminModeration}?tab=health`;
  }
  if (type === "community_report_filed") {
    const communitySlug = payload?.communitySlug;
    // No slug means no destination: this row only ever reaches a community's
    // own staff, who have no access to the platform queue, so falling back
    // there would hand them a link into a redirect. The row still reads.
    return typeof communitySlug === "string" && communitySlug
      ? `${communityPath(communitySlug)}?tab=modtools&mod=reports`
      : undefined;
  }
  // Same shape, same reason: an offer of support is answered in the community's
  // own mod-tools console, so that pane is the destination rather than the
  // community page. This row only ever reaches a community's staff, who can
  // open it (OPS-05).
  if (type === "community_support_offered") {
    const communitySlug = payload?.communitySlug;
    return typeof communitySlug === "string" && communitySlug
      ? `${communityPath(communitySlug)}?tab=modtools&mod=support`
      : undefined;
  }
  if (!payload) return undefined;
  if (payload.source === "forum") {
    const threadSlug = payload.threadSlug;
    return typeof threadSlug === "string" && threadSlug
      ? thread(threadSlug)
      : undefined;
  }
  if (payload.source === "community") {
    const communitySlug = payload.communitySlug;
    if (typeof communitySlug !== "string" || !communitySlug) return undefined;
    const postId = payload.postId;
    return typeof postId === "string" && postId
      ? communityPostPath(communitySlug, postId)
      : communityPath(communitySlug);
  }
  // A real cohost invite (SDD 2026-08-18 "cohost invite flow") has its own
  // `source` value, distinct from plain event/event_rsvp notifications. It
  // deep-links to the invite page, using the invite id.
  if (payload.source === "cohost_invite") {
    const eventSlug = payload.eventSlug;
    const inviteId = payload.inviteId;
    return typeof eventSlug === "string" &&
      eventSlug &&
      typeof inviteId === "string" &&
      inviteId
      ? coHostInvitePath(eventSlug, inviteId)
      : undefined;
  }
  // Coverage-sweep sources — each deep-links to the entity the notification is
  // about. A missing slug falls back to no href (the row still shows its text /
  // actor link) rather than inventing a broken link.
  if (payload.source === "event") {
    const eventSlug = payload.eventSlug;
    return typeof eventSlug === "string" && eventSlug
      ? gatheringPath(eventSlug)
      : undefined;
  }
  if (payload.source === "job") {
    const jobSlug = payload.jobSlug;
    return typeof jobSlug === "string" && jobSlug
      ? `${routes.jobs}/${jobSlug}`
      : undefined;
  }
  if (payload.source === "listing") {
    const listingSlug = payload.listingSlug;
    return typeof listingSlug === "string" && listingSlug
      ? businessPath(listingSlug)
      : undefined;
  }
  // Account and security rows (ID-06). Each goes to the page where the member
  // can DO the thing the row is about, which is the whole reason to notify:
  // an unrecognised sign-in is only actionable next to a "Sign out" button.
  // None needs a slug.
  if (payload.source === "security") {
    return routes.sessions;
  }
  if (payload.source === "account_data") {
    return routes.dataExport;
  }
  // A card nearing expiry → the member's own wallet, which is where the Renew
  // control lives and where the expiry is spelled out on the card itself. Its
  // own `source` value rather than `account`, which already means the
  // delete-account page. No slug needed.
  if (payload.source === "card") {
    return routes.myCards;
  }
  if (payload.source === "account") {
    return routes.deleteAccount;
  }
  // A decision on a data-subject request → the data-request page, which lists
  // the member's own reference history, so the row they were just handed can be
  // matched to the case it is about. Its own `source` value rather than
  // `account`, which already means "the delete-account page".
  if (payload.source === "account_dsar") {
    return routes.dsar;
  }
  // A reviewed intake submission has NO destination, on purpose. There is no
  // member-facing page for a Culture submission, a micro-grant application or a
  // sober-host listing: the row carries the whole outcome. Linking back to the
  // form would read as "fill this in again", which is the opposite of what just
  // happened, so the row stays text-only.
  if (payload.source === "intake") {
    return undefined;
  }
  // A shipped magazine issue (CON-05) → that issue's own page, where the
  // desk's curated "In this issue" panel lives. The issue number is the route
  // segment, so a row missing it drops the link rather than landing on the
  // bare current-issue route and showing the wrong issue.
  if (payload.source === "magazine") {
    const issueNumber = payload.issueNumber;
    return typeof issueNumber === "string" && issueNumber
      ? `${routes.issue}/${encodeURIComponent(issueNumber)}`
      : undefined;
  }
  // Roadmap idea status → the public roadmap; appeal outcome → the member's
  // appeal-outcome page. Neither needs a slug. A resolved report has no
  // member-facing detail page, so it deliberately yields no deep-link.
  if (payload.source === "roadmap") {
    return routes.roadmap;
  }
  if (payload.source === "appeal") {
    return routes.appealOutcome;
  }
  // A moderation outcome (warn/suspend/ban) links to the appeal page so the
  // decision is contestable. No slug needed.
  if (payload.source === "moderation") {
    return routes.appealSubmit;
  }
  // A swap proposal carries no `source` field: its payload allowlist passes
  // `barterListingId` and `listingOffer` only, so it is matched on that id
  // directly. It deep-links to the owner's proposal inbox with the listing
  // already selected, which is the one place the proposal can be answered.
  const barterListingId = payload.barterListingId;
  if (typeof barterListingId === "string" && barterListingId) {
    return barterProposalsPath(barterListingId);
  }
  return undefined;
}

/** "Inês Tavares" from the actor's name parts, trimmed of a missing half. */
function actorName(actor: NotificationActorDTO): string {
  return `${actor.firstName} ${actor.lastName}`.trim();
}

/** Monogram for the avatar fallback when the member has no photo. */
function actorInitials(actor: NotificationActorDTO): string {
  const first = actor.firstName.trim()[0] ?? "";
  const last = actor.lastName.trim()[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}

/** The non-default avatar tints, in a fixed order for the hash below. */
const AVATAR_TINTS: AvatarTint[] = ["coral", "jade", "plum"];

/**
 * Deterministically pick a tint from the member's slug, so the same person
 * always gets the same colour and the feed isn't monochrome. Purely cosmetic —
 * only reached when they have no avatar photo.
 */
function tintForSlug(slug: string): AvatarTint {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash + slug.charCodeAt(index)) % AVATAR_TINTS.length;
  }
  return AVATAR_TINTS[hash] ?? "coral";
}

/**
 * Format an ISO timestamp to a short date label; "" when absent. Goes through
 * `useFormat()`'s locale-bound `Intl.DateTimeFormat` (via the `fmt` passed
 * in) rather than `toLocaleDateString(undefined, …)` — the previous version
 * always rendered in the browser's system locale, ignoring the member's
 * chosen app language entirely.
 */
function formatTime(iso: string | undefined, fmt: Formatters): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return fmt.date(date, { month: "short", day: "numeric" });
}
