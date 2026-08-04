import type { IconType } from "react-icons";
import { FiBell, FiCalendar, FiMessageCircle, FiUsers } from "react-icons/fi";
import {
  businessPath,
  communityPath,
  routes,
  thread,
} from "../../../app/routeMap";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";
import type { Notification, NotifType } from "../notifications.types";
import { formatNotification, type NotificationKind } from "./formatNotification";
import type { NotificationActorDTO, NotificationDTO } from "./notifications.api";

/** Each notification kind → the icon its row renders with (no avatar from the API). */
const KIND_ICONS: Record<NotifType, IconType> = {
  messages: FiMessageCircle,
  events: FiCalendar,
  community: FiUsers,
  platform: FiBell,
};

/** Subtle tinted background behind each kind's icon, matching the mock palette. */
const KIND_ICON_BACKGROUND: Record<NotifType, string> = {
  messages: "rgba(74,140,111,.1)",
  events: "rgba(232,119,90,.1)",
  community: "rgba(45,27,61,.07)",
  platform: "rgba(45,27,61,.07)",
};

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
  "mention",
  "forum_reply",
  // Coverage-sweep kinds that carry a member actor (and so a `textNamed`
  // variant). The system-driven ones (join_request_approved/declined,
  // listing_approved, report_resolved, appeal_resolved, roadmap_status) resolve
  // no actor and keep their generic `.text`.
  "event_rsvp",
  "community_reply",
  "forum_thread_reply",
  "join_request_received",
  "job_application",
  "invite_accepted",
  "listing_review",
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

  view.sourceHref = sourceHrefFromPayload(dto.payload);

  return view;
}

/**
 * Deep-link to the thread/discussion a notification originated from, built
 * from `payload.source` + its slug field — `thread(threadSlug)` for a forum
 * mention, `communityPath(communitySlug)` for a community one. `payload` is
 * `Record<string, unknown>` (server-trusted but untyped on this side), so
 * every field is read defensively.
 *
 * Returns `undefined` — never a broken link — whenever the needed slug is
 * missing. In particular, the community FLAT post/reply paths
 * (`createFlatPost`/`addFlatReply`) write a payload with `postId` but no
 * `communitySlug`; those rows fall back to no source href (the row still
 * shows the actor link) rather than inventing one.
 */
function sourceHrefFromPayload(
  payload: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!payload) return undefined;
  if (payload.source === "forum") {
    const threadSlug = payload.threadSlug;
    return typeof threadSlug === "string" && threadSlug
      ? thread(threadSlug)
      : undefined;
  }
  if (payload.source === "community") {
    const communitySlug = payload.communitySlug;
    return typeof communitySlug === "string" && communitySlug
      ? communityPath(communitySlug)
      : undefined;
  }
  // Coverage-sweep sources — each deep-links to the entity the notification is
  // about. A missing slug falls back to no href (the row still shows its text /
  // actor link) rather than inventing a broken link.
  if (payload.source === "event") {
    const eventSlug = payload.eventSlug;
    return typeof eventSlug === "string" && eventSlug
      ? `${routes.gatherings}/${eventSlug}`
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
