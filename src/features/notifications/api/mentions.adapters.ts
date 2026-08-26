import { communityPath, thread } from "../../../app/routeMap";
import { communityPostPath } from "../../communities/communityPostPath";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { Mention, MentionAction, MentionCategory } from "../mentions.data";
import type { MentionActorDTO, MentionDTO } from "./mentions.api";
import type { MentionDay } from "./useMentions";

/** The avatar tints a live mention row can take (a subset of `AvatarTint`). */
const TINTS: Mention["tint"][] = ["coral", "jade", "plum"];

/**
 * Deterministically pick a tint from the member's slug so the same person is
 * always the same colour and the thread isn't monochrome. Purely cosmetic —
 * mirrors `notifications.adapters.ts#tintForSlug`.
 */
function tintForSlug(slug: string): Mention["tint"] {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash + slug.charCodeAt(index)) % TINTS.length;
  }
  return TINTS[hash] ?? "coral";
}

/** Monogram for the avatar fallback when the member has no photo. */
function actorInitials(actor: MentionActorDTO): string {
  const first = actor.firstName.trim()[0] ?? "";
  const last = actor.lastName.trim()[0] ?? "";
  return `${first}${last}`.toUpperCase() || "@";
}

/** What the mention is "about", for the tab filter. */
function categoryFor(dto: MentionDTO): MentionCategory {
  if (dto.entityKind === "event") return "event";
  if (dto.source === "forum" || dto.source === "community") return "post";
  return "other";
}

/** The translated "in a thread" / "in a {community} post" descriptor. */
function contextFor(dto: MentionDTO, t: TFunction): string {
  if (dto.source === "forum") {
    return t("notifications:mentions.context.thread");
  }
  if (dto.source === "community") {
    return dto.sourceLabel
      ? t("notifications:mentions.context.communityPost", {
          community: dto.sourceLabel,
        })
      : t("notifications:mentions.liveContext.community");
  }
  return t("notifications:mentions.liveContext.generic");
}

/** The label after the "In" prefix — the resolved source, or a generic fallback. */
function whereTextFor(dto: MentionDTO, t: TFunction): string {
  return dto.sourceLabel ?? t("notifications:mentions.liveWhere.fallback");
}

/**
 * A deep-link to the mention's source, or `undefined` when it can't be built.
 *
 * A community mention resolves to the POST'S OWN PERMALINK when the row
 * carries a `postId` (SOC-02). It used to resolve to `communityPath` and drop
 * the id, so "@you were mentioned" opened the top of a paginated timeline and
 * left the member to find the sentence with their name in it. A community
 * mention with no `postId` still opens the community, which is the honest
 * destination when the post is not identified.
 */
function whereToFor(dto: MentionDTO): string | undefined {
  if (dto.source === "forum" && dto.threadSlug) return thread(dto.threadSlug);
  if (dto.source === "community" && dto.communitySlug) {
    return dto.postId
      ? communityPostPath(dto.communitySlug, dto.postId)
      : communityPath(dto.communitySlug);
  }
  return undefined;
}

/**
 * Honest live actions: open the source (when it deep-links) + mark read. The
 * demo's inline reply/RSVP are omitted — replying isn't wired to the backend
 * here, so offering it in live would be a fake affordance.
 */
function actionsFor(
  dto: MentionDTO,
  whereTo: string | undefined,
): MentionAction[] {
  const actions: MentionAction[] = [];
  if (whereTo) {
    actions.push({
      type: dto.source === "forum" ? "openThread" : "openPost",
      primary: true,
    });
  }
  actions.push({ type: "markRead" });
  return actions;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bucket a timestamp into the inbox's day groups, relative to now. */
function dayBucketFor(
  createdAt: Date,
  t: TFunction,
): { key: string; label: string } {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const time = createdAt.getTime();
  if (time >= startOfToday) {
    return { key: "today", label: t("notifications:mentions.day.today") };
  }
  if (time >= startOfToday - DAY_MS) {
    return {
      key: "yesterday",
      label: t("notifications:mentions.day.yesterday"),
    };
  }
  if (time >= startOfToday - 7 * DAY_MS) {
    return { key: "thisWeek", label: t("notifications:mentions.day.thisWeek") };
  }
  return { key: "earlier", label: t("notifications:mentions.day.earlier") };
}

/** A locale-aware "14 minutes ago" from an ISO timestamp. */
function relativeWhen(createdAt: Date, fmt: Formatters): string {
  const diffMinutes = Math.round((createdAt.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 60) return fmt.relativeTime(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return fmt.relativeTime(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return fmt.relativeTime(diffDays, "day");
  return fmt.relativeTime(Math.round(diffDays / 7), "week");
}

/** Map one backend mention row to the panel's `Mention` view-model. */
function toMention(dto: MentionDTO, t: TFunction, fmt: Formatters): Mention {
  const createdAt = new Date(dto.createdAt);
  const whereTo = whereToFor(dto);
  const name = dto.actor
    ? `${dto.actor.firstName} ${dto.actor.lastName}`.trim()
    : t("notifications:mentions.liveActor.unknown");
  const fresh = !dto.read && Date.now() - createdAt.getTime() < DAY_MS;
  return {
    id: dto.id,
    initials: dto.actor ? actorInitials(dto.actor) : "@",
    tint: dto.actor ? tintForSlug(dto.actor.slug) : "coral",
    name,
    actorSlug: dto.actor?.slug,
    category: categoryFor(dto),
    context: contextFor(dto, t),
    when: relativeWhen(createdAt, fmt),
    createdAtIso: dto.createdAt,
    fresh,
    unread: !dto.read,
    content: dto.excerpt,
    whereText: whereTextFor(dto, t),
    whereTo,
    actions: actionsFor(dto, whereTo),
  };
}

/**
 * Group a page of backend mention rows into the day-bucketed `MentionDay[]` the
 * panel renders. Rows arrive newest-first, so first-seen order of the buckets is
 * already today → yesterday → this week → earlier.
 */
export function buildLiveMentionDays(
  dtos: MentionDTO[],
  t: TFunction,
  fmt: Formatters,
): MentionDay[] {
  const groups = new Map<string, MentionDay>();
  for (const dto of dtos) {
    const mention = toMention(dto, t, fmt);
    const bucket = dayBucketFor(new Date(dto.createdAt), t);
    const existing = groups.get(bucket.key);
    if (existing) existing.items.push(mention);
    else groups.set(bucket.key, { day: bucket.label, items: [mention] });
  }
  return Array.from(groups.values());
}
