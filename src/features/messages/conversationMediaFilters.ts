// src/features/messages/conversationMediaFilters.ts
import {
  isDocumentAttachment,
  type DocumentAttachment,
} from "../../shared/api/documentAttachment";
import { isStickerAttachment } from "../../shared/api/stickerAttachment";
import type { GifAttachment } from "../../shared/api/gifs";
import type { ConversationMediaKind } from "./api/conversationMedia.api";
import { firstLinkUrl, formatLinkLabel } from "./linkify";
import { isViewablePhoto } from "./useThreadImageGallery";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage } from "./data";
import { colleagueSenderLabel, isTypedByViewer } from "./viewerSideSender";

/** One message on a gallery shelf, with the moment it is dated by. */
export interface ConversationMediaEntry {
  message: ChatMessage;
  /** An ISO timestamp (live `createdAt`), a bare calendar date (a demo day
   *  bucket's `dayKey`), or null when the message carries neither. */
  at: string | null;
}

/** A URL found in a message, with the shortened label a bubble shows for it. */
export interface ConversationMediaLink {
  href: string;
  label: string;
}

/** A month of the Media grid. `heading` is null for undated entries, which
 *  the component labels through the catalog. */
export interface ConversationMediaSection {
  key: string;
  heading: string | null;
  entries: ConversationMediaEntry[];
}

const UNDATED_SECTION_KEY = "undated";

/**
 * Every distinct http(s) or bare `www.` URL in `text`, in reading order,
 * normalised the way `firstLinkUrl` normalises one. Walks the text through
 * `firstLinkUrl` itself so the gallery and the linkified bubble can never
 * disagree about what counts as a link. A bare `www.` match comes back with an
 * `https://` scheme, so the cursor advances past whichever spelling actually
 * sits in the text first.
 */
export function extractLinkUrls(text: string): string[] {
  const urls: string[] = [];
  let remaining = text;
  for (
    let href = firstLinkUrl(remaining);
    href !== null;
    href = firstLinkUrl(remaining)
  ) {
    const bareSpelling = href.startsWith("https://www.")
      ? href.slice("https://".length)
      : null;
    const fullIndex = remaining.indexOf(href);
    const bareIndex = bareSpelling ? remaining.indexOf(bareSpelling) : -1;
    const isBareMatch =
      bareSpelling !== null &&
      bareIndex !== -1 &&
      (fullIndex === -1 || bareIndex < fullIndex);
    const matchIndex = isBareMatch ? bareIndex : fullIndex;
    if (matchIndex === -1) break;
    if (!urls.includes(href)) urls.push(href);
    const matchLength = isBareMatch ? bareSpelling.length : href.length;
    remaining = remaining.slice(matchIndex + matchLength);
  }
  return urls;
}

/**
 * The links a TEXT message shares: the URLs in the body of a `user` message
 * (`kind` absent or "user"). Photo, GIF and document captions are left out,
 * matching the backend's Links shelf exactly (a body match on
 * `(https?://|www\.)` over `user` messages only), so demo and live list the
 * same rows. Deleted messages share none.
 */
export function messageLinks(message: ChatMessage): ConversationMediaLink[] {
  if (message.deletedAt) return [];
  if (message.kind !== undefined && message.kind !== "user") return [];
  return extractLinkUrls(message.text).map((href) => ({
    href,
    label: formatLinkLabel(href),
  }));
}

/** The photo or GIF a message shows, when the viewer could open it. A sticker
 *  is excluded the same way a document is: `isViewablePhoto` already gates
 *  on `kind` being `"image"`/`"gif"`, which a sticker's own `"sticker"` kind
 *  never satisfies, so this second check is belt-and-suspenders against the
 *  attachment shape itself rather than the kind label alone. */
export function photoAttachmentOf(message: ChatMessage): GifAttachment | null {
  if (!isViewablePhoto(message)) return null;
  const attachment = message.attachment;
  return attachment &&
    !isDocumentAttachment(attachment) &&
    !isStickerAttachment(attachment)
    ? attachment
    : null;
}

/** The file a document message carries, unless the message was deleted. */
export function documentAttachmentOf(
  message: ChatMessage,
): DocumentAttachment | null {
  if (message.kind !== "document" || message.deletedAt) return null;
  return isDocumentAttachment(message.attachment) ? message.attachment : null;
}

/** Whether `message` belongs on the `kind` shelf. The shelves are disjoint:
 *  a photo or document keeps to its own shelf whatever its caption holds. */
export function matchesMediaKind(
  message: ChatMessage,
  kind: ConversationMediaKind,
): boolean {
  switch (kind) {
    case "media":
      return photoAttachmentOf(message) !== null;
    case "documents":
      return documentAttachmentOf(message) !== null;
    case "links":
      return messageLinks(message).length > 0;
  }
}

export function filterEntriesByKind(
  entries: ConversationMediaEntry[],
  kind: ConversationMediaKind,
): ConversationMediaEntry[] {
  return entries.filter((entry) => matchesMediaKind(entry.message, kind));
}

/** Day-bucketed thread groups (oldest first, as the panel renders them) as
 *  one newest-first entry list. A message without its own `at` is dated by
 *  its bucket's `dayKey`. */
export function flattenNewestFirst(
  groups: { dayKey?: string; items: ChatMessage[] }[],
): ConversationMediaEntry[] {
  const entries: ConversationMediaEntry[] = [];
  for (const group of groups) {
    for (const message of group.items) {
      entries.push({ message, at: message.at ?? group.dayKey ?? null });
    }
  }
  return entries.reverse();
}

/**
 * The entries in `renderedGroups` this session added that `baseGroups` (demo
 * mode's own un-paged shelf source) does not carry yet, newest first. A
 * message counts as session-only when its client `localId` is absent from
 * every item in `baseGroups`, the same identity `mergeOptimisticGroups` uses
 * to tell a still-optimistic send apart from its settled copy. Demo mode's
 * gallery shelves read the scripted thread directly, so an unopened
 * conversation still shows its whole mock gallery, which is exactly why a
 * photo or document sent this session needs merging in here to show up at
 * all.
 */
export function sessionOnlyEntries(
  baseGroups: { items: ChatMessage[] }[],
  renderedGroups: { dayKey?: string; items: ChatMessage[] }[],
): ConversationMediaEntry[] {
  const baseLocalIds = new Set<string>();
  for (const group of baseGroups) {
    for (const item of group.items) {
      if (item.localId) baseLocalIds.add(item.localId);
    }
  }
  return flattenNewestFirst(renderedGroups).filter(
    (entry) =>
      entry.message.localId && !baseLocalIds.has(entry.message.localId),
  );
}

/** A bare calendar date ("2026-09-15") is a LOCAL day; `new Date` would read
 *  it as UTC midnight and slip it back a day west of Greenwich. */
function parseEntryDate(at: string | null): Date | null {
  if (!at) return null;
  const calendarDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(at);
  const date = calendarDate
    ? new Date(
        Number(calendarDate[1]),
        Number(calendarDate[2]) - 1,
        Number(calendarDate[3]),
      )
    : new Date(at);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Newest-first entries grouped by calendar month in first-seen order, each
 *  headed "March 2026" in `locale`. Undated entries share one trailing-order
 *  section with a null heading. */
export function groupEntriesByMonth(
  entries: ConversationMediaEntry[],
  locale: string,
): ConversationMediaSection[] {
  const sections = new Map<string, ConversationMediaSection>();
  for (const entry of entries) {
    const date = parseEntryDate(entry.at);
    const key = date
      ? `${date.getFullYear()}-${date.getMonth() + 1}`
      : UNDATED_SECTION_KEY;
    const existing = sections.get(key);
    if (existing) {
      existing.entries.push(entry);
      continue;
    }
    sections.set(key, {
      key,
      heading: date
        ? date.toLocaleDateString(locale, { month: "long", year: "numeric" })
        : null,
      entries: [entry],
    });
  }
  return [...sections.values()];
}

/** "3 March", with the year added outside the current one. Empty when the
 *  entry has no usable date. */
export function entryDateLabel(
  at: string | null,
  locale: string,
  now: Date = new Date(),
): string {
  const date = parseEntryDate(at);
  if (!date) return "";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** Who shared a message: "You" for the viewer's own, the business with the
 *  colleague's first name for a business reply a colleague typed, the group
 *  sender's name, or the DM counterpart (a demo DM message carries no
 *  `senderName`). `t` names the colleague's business; without it such an
 *  entry reads as the business alone. */
export function entrySenderName(
  message: ChatMessage,
  counterpartName: string,
  youLabel: string,
  t?: TFunction,
): string {
  if (isTypedByViewer(message)) return youLabel;
  if (message.from === "me" && t) return colleagueSenderLabel(message, t);
  return message.senderName ?? counterpartName;
}

/** `1.2 MB` / `340 KB` / `48 B`, the same format the document bubble prints
 *  (`MessageDocumentAttachment`, whose helper is not exported). */
export function formatDocumentSize(byteSize: number): string {
  if (byteSize < 1024) return `${byteSize} B`;
  if (byteSize < 1024 * 1024) return `${(byteSize / 1024).toFixed(1)} KB`;
  return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`;
}
