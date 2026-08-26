import { formatDate } from "../../../shared/lib/date";
import {
  relativeAgo as localizedRelativeAgo,
  type RelativeAgoKeys,
} from "../../../shared/lib/relativeAgo";
import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";
import { initialsOf, tintForSlug } from "../../members/api/members.adapters";
import type { BlockDTO } from "../../social/api/social.api";
import type { ConnectionMeta, ConnectionView } from "../connections.data";
import type { TabId } from "../connections.data";
import type { ConnectionApiTab, ConnectionDTO } from "./connections.api";

/**
 * Map a page tab to the backend's `tab` query value. "blocked" has no API tab —
 * it's owned by SocialProvider — so it's excluded from this mapping (the page
 * keeps rendering blocked from local social state).
 */
export const API_TAB: Partial<Record<TabId, ConnectionApiTab>> = {
  all: "all",
  incoming: "incoming",
  sent: "outgoing",
  vouched: "vouched",
};

/** The two non-numeric idioms the request-age label needs, as catalog keys. */
export const CONNECT_AGO_KEYS: RelativeAgoKeys = {
  justNow: "connect:ago.justNow",
  unknown: "connect:ago.unknown",
};

/**
 * Compact "how long ago" label for a request. The backend sends a raw ISO
 * `createdAt`; the age is derived here through the shared localized helper, so
 * the numeric distance goes through the member's own `Intl.RelativeTimeFormat`
 * ("há 3 dias" in pt) instead of a hand-rolled English `3 days ago`.
 */
export function relativeAgo(
  iso: string | null,
  t: TFunction,
  fmt: Formatters,
  now: number = Date.now(),
): string | undefined {
  if (!iso) return undefined;
  return localizedRelativeAgo(iso, t, fmt, CONNECT_AGO_KEYS, now);
}

/**
 * Full date-and-time label the "Connected since" line renders, e.g.
 * "Mar 3, 2025, 2:30 PM" — day and hour, not just month/year, so the moment a
 * connection was made is legible at a glance.
 */
export function connectedAt(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return formatDate(date, undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Extract just the relationship metadata a card renders — mutuals, vouch badge,
 * request note, and the introducer, all sourced from the connections response.
 */
export function dtoToMeta(
  dto: ConnectionDTO,
  t: TFunction,
  fmt: Formatters,
): ConnectionMeta {
  const introducer = dto.introducedBy;
  return {
    id: dto.id,
    pron: dto.member.pronouns ?? undefined,
    mutuals: dto.mutuals,
    vouchBadge: dto.vouchBadge ?? undefined,
    // Accepted connections show when they were accepted; pending ones fall back
    // to when the request was sent (only the accepted tabs render "since").
    since: connectedAt(dto.respondedAt ?? dto.createdAt),
    // The raw ISO behind `since`, so the profile "Your network" section can sort
    // connections by recency without re-parsing the display string.
    connectedAtIso: dto.respondedAt ?? dto.createdAt,
    requestMessage: dto.requestMessage ?? undefined,
    requestReason: dto.requestReason ?? undefined,
    isRequestedByYou: dto.isRequestedByYou,
    // The viewer's own note. The server never sends the other party's, so
    // there is nothing here to gate on the client.
    note: dto.note ?? undefined,
    sentAgo: relativeAgo(dto.createdAt, t, fmt),
    introducedBy: introducer
      ? {
          slug: introducer.slug,
          name: `${introducer.firstName} ${introducer.lastName}`.trim(),
        }
      : undefined,
  };
}

/**
 * Map a connection DTO to the prototype's `ConnectionView` — the exact shape the
 * cards already render. Member fields come from the nested `member` object;
 * avatar initials/tint are derived the same deterministic way as the members
 * adapter, so live cards look identical to mock ones.
 */
export function connectionDtoToView(
  dto: ConnectionDTO,
  t: TFunction,
  fmt: Formatters,
): ConnectionView {
  const { member } = dto;
  return {
    slug: member.slug,
    name: `${member.firstName} ${member.lastName}`.trim(),
    initials: initialsOf(member.firstName, member.lastName),
    tint: tintForSlug(member.slug),
    photo: member.avatarUrl ?? undefined,
    role: member.tagline ?? "",
    pron: member.pronouns ?? undefined,
    tags: [],
    meta: dtoToMeta(dto, t, fmt),
  };
}

/**
 * Map a `GET /blocks` row to the same `ConnectionView` the cards render, so the
 * live Blocked tab has a real server-backed source. Never route a live slug
 * through `connectionViews()` — that resolves against the demo member registry,
 * which holds none of the real members a live block can name.
 *
 * `BlockDTO.member` is the shared `MemberRefDTO`: name + avatar only, no
 * tagline/pronouns, so the card renders an honest identity row with no
 * relationship meta rather than inventing any.
 */
export function blockDtoToView(dto: BlockDTO): ConnectionView {
  const { member } = dto;
  return {
    slug: member.slug,
    name: `${member.firstName} ${member.lastName}`.trim(),
    initials: initialsOf(member.firstName, member.lastName),
    tint: tintForSlug(member.slug),
    photo: member.avatarUrl ?? undefined,
    role: "",
    tags: [],
    meta: {},
  };
}
