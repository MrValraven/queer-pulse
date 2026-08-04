import { formatDate } from "../../../shared/lib/date";
import { initialsOf, tintForSlug } from "../../members/api/members.adapters";
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

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Compact "how long ago" label for a request, matching the mock convention
 * ("just now" / "2h ago" / "yesterday" / "3 days ago"). The backend sends a raw
 * ISO `createdAt`; the age is derived here. Pure (with an injectable `now`) so
 * the list adapter stays side-effect-free and testable.
 */
export function relativeAgo(
  iso: string | null,
  now: number = Date.now(),
): string | undefined {
  if (!iso) return undefined;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return undefined;
  const delta = Math.max(0, now - then);
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  const days = Math.floor(delta / DAY);
  return days === 1 ? "yesterday" : `${days} days ago`;
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
export function dtoToMeta(dto: ConnectionDTO): ConnectionMeta {
  const introducer = dto.introducedBy;
  return {
    id: dto.id,
    pron: dto.member.pronouns ?? undefined,
    mutuals: dto.mutuals,
    vouchBadge: dto.vouchBadge ?? undefined,
    // Accepted connections show when they were accepted; pending ones fall back
    // to when the request was sent (only the accepted tabs render "since").
    since: connectedAt(dto.respondedAt ?? dto.createdAt),
    requestMessage: dto.requestMessage ?? undefined,
    requestReason: dto.requestReason ?? undefined,
    sentAgo: relativeAgo(dto.createdAt),
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
export function connectionDtoToView(dto: ConnectionDTO): ConnectionView {
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
    meta: dtoToMeta(dto),
  };
}
