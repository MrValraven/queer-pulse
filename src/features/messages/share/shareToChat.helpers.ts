import type { Conversation } from "../data";

/**
 * What kind of thing is being shared, used only to shape the modal's own
 * copy (title/empty-state framing); the send path itself is identical for
 * every kind (PRD-347).
 */
export type ShareableKind =
  "article" | "listing" | "community" | "directory" | "gathering" | "generic";

/**
 * Absolute-ize a same-origin path so the message body always carries a link
 * the recipient's existing link-preview can unfurl, regardless of whether the
 * calling surface already had `window.location.href` on hand (most do) or
 * only a router-relative path (`ArticleToolbar`'s derived `href`). An
 * already-absolute URL passes through unchanged.
 */
export function toAbsoluteShareUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
}

/**
 * The message body a share actually sends: an optional note, then the link on
 * its own line so it reads as a normal DM and the recipient's link-preview
 * still unfurls it. No note → the body is just the link.
 */
export function buildShareBody(note: string, url: string): string {
  const trimmedNote = note.trim();
  return trimmedNote ? `${trimmedNote}\n${url}` : url;
}

/**
 * A conversation is only worth offering as a share target when the ordinary
 * send path would actually accept a message into it right now: a group the
 * member has left, or a cold enquiry thread still waiting on a connection,
 * would only 403 (PRD-347 evidence: `replyRequiresConnection`/`hasLeft`
 * already gate the ordinary composer the same way).
 */
export function isConversationShareable(conversation: Conversation): boolean {
  return !conversation.hasLeft && !conversation.replyRequiresConnection;
}
