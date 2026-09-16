// src/features/messages/starredMessagesFilter.ts
import type { StarredMessageHit } from "../../shared/contracts/contracts";
import { firstLinkUrl } from "./linkify";

/**
 * Segmented-control values for the starred-messages toolbar (PRD-374).
 * "photos"/"documents" key off the starred hit's message `kind`; "links"
 * needs no such field, since it reads straight off the `snippet` already on
 * the wire. `StarredMessageHit` (`GET /messages/starred`) carries `kind` and
 * `attachment`, mirroring `MessageResponse`, so all four values are fully
 * functional on real data.
 */
export type StarredMessageFilterType = "all" | "photos" | "documents" | "links";

/**
 * A starred hit plus the caller-resolved `conversationTitle`. The modal
 * already resolves this per group via `groupIdentity`, the same lookup that
 * renders the row, so the filter doesn't need to know how to do it itself.
 */
export interface FilterableStarredMessage extends StarredMessageHit {
  conversationTitle: string;
}

/** Case- and accent-insensitive normalization: NFD-decomposes then strips
 *  the combining marks, so "café" and "cafe" match the same query. */
function normalizeForSearch(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function matchesStarredMessageType(
  item: FilterableStarredMessage,
  type: StarredMessageFilterType,
): boolean {
  switch (type) {
    case "all":
      return true;
    case "photos":
      return item.kind === "image" || item.kind === "gif";
    case "documents":
      return item.kind === "document";
    case "links":
      // Reuses `firstLinkUrl` (`linkify.tsx`), so a bare `www.` address
      // (which the thread's own bubble already renders as a tappable link)
      // counts as a "Links" hit too, the same detection the composer and
      // every bubble already share. Restricted to an ordinary text bubble
      // (`kind === "user"`), exactly like `conversationMediaFilters.ts`'s
      // Links tab and the backend's own `type=links` matching, so a caption
      // on a photo/document bubble does not count here either.
      // `item.snippet` is the only text a starred hit carries (the wire
      // shape never sends the full body), so a match beyond the server's
      // 160-char window is out of reach here; live mode's server-side `type`
      // filter already scans the full body for the authoritative match, this
      // client-side pass only narrows instantly while that request is in
      // flight.
      return item.kind === "user" && firstLinkUrl(item.snippet) !== null;
    default:
      return true;
  }
}

/** The attachment's caption, empty for a plain-text hit or an uncaptioned one. */
function attachmentCaption(item: FilterableStarredMessage): string {
  return item.attachment?.caption ?? "";
}

/** The attachment's file name, only present on the document variant. */
function attachmentFileName(item: FilterableStarredMessage): string {
  const attachment = item.attachment;
  return attachment && "fileName" in attachment ? attachment.fileName : "";
}

function matchesStarredMessageQuery(
  item: FilterableStarredMessage,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) return true;
  const haystacks = [
    item.snippet,
    attachmentCaption(item),
    attachmentFileName(item),
    item.sender.displayName,
    item.conversationTitle,
  ];
  return haystacks.some((value) =>
    normalizeForSearch(value).includes(normalizedQuery),
  );
}

/**
 * Pure client-side filter over the caller's already-loaded starred list. No
 * debounce needed, since there is no network round-trip to save one from.
 * Empty query returns every item that matches `type`.
 */
export function filterStarredMessages(
  items: FilterableStarredMessage[],
  query: string,
  type: StarredMessageFilterType,
): FilterableStarredMessage[] {
  const normalizedQuery = normalizeForSearch(query.trim());
  return items.filter(
    (item) =>
      matchesStarredMessageType(item, type) &&
      matchesStarredMessageQuery(item, normalizedQuery),
  );
}
