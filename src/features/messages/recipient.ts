import type { Conversation } from "./data";

/**
 * A placeholder thread for a member the viewer has no local thread with yet.
 * Used by the "Message" deep-link: it seeds the open thread instantly (initials
 * avatar, empty history); in live mode `startConversation(slug)` then find-or-
 * creates the real conversation and the refetched list replaces this stub.
 */
export function buildRecipientConversation(
  slug: string,
  name: string,
  avatarUrl?: string,
): Conversation {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
  return {
    id: slug,
    slug,
    initials,
    tint: "plum",
    avatarUrl,
    name,
    pronouns: "",
    connectedSince: "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
  };
}
