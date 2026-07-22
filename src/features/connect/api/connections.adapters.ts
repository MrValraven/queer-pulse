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

/** Extract just the relationship metadata a card renders, defaulting the rest. */
export function dtoToMeta(dto: ConnectionDTO): ConnectionMeta {
  return {
    id: dto.id,
    pron: dto.pronouns,
    mutuals: dto.mutuals,
    since: dto.since,
    vouchBadge: dto.vouchBadge,
    requestMessage: dto.requestMessage,
    requestReason: dto.requestReason,
    sentAgo: dto.sentAgo,
  };
}

/**
 * Map a connection DTO to the prototype's `ConnectionView` — the exact shape the
 * cards already render. Avatar initials/tint are derived the same deterministic
 * way as the members adapter, so live cards look identical to mock ones.
 */
export function connectionDtoToView(dto: ConnectionDTO): ConnectionView {
  return {
    slug: dto.slug,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    initials: initialsOf(dto.firstName, dto.lastName),
    tint: tintForSlug(dto.slug),
    photo: dto.avatarUrl ?? undefined,
    role: dto.tagline ?? "",
    pron: dto.pronouns,
    tags: dto.tags ?? [],
    meta: dtoToMeta(dto),
  };
}
