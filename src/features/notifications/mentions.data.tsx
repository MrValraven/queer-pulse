import type { ReactNode } from "react";

export type MentionTabId = "all" | "unread" | "posts" | "articles" | "events";

/** Stable `id` is what the page's tab-matching switches on — the display
 * `labelKey` translates but must never be the lookup value itself (i18n sweep
 * §5.1: a translated label doubling as a stored/matched key breaks filtering
 * in pt mode only). */
export const MENTION_TAB_DEFS: {
  id: MentionTabId;
  labelKey: string;
}[] = [
  { id: "all", labelKey: "notifications:mentions.tabs.all" },
  { id: "unread", labelKey: "notifications:mentions.tabs.unread" },
  { id: "posts", labelKey: "notifications:mentions.tabs.posts" },
  { id: "articles", labelKey: "notifications:mentions.tabs.articles" },
  { id: "events", labelKey: "notifications:mentions.tabs.events" },
];

/** What a mention row is "about", for tab filtering — kept separate from the
 * translated `context` display string so a language switch never breaks
 * filtering (the previous version matched substrings of the English label). */
export type MentionCategory = "post" | "article" | "event" | "other";

export type MentionActionType =
  "reply" | "openThread" | "markRead" | "openArticle" | "rsvp" | "openPost";

export interface MentionAction {
  type: MentionActionType;
  primary?: boolean;
}

export interface Mention {
  id: string;
  initials: string;
  tint: "coral" | "jade" | "plum";
  name: string;
  /** Member slug for `name`, when it resolves to a real member account. Left
   *  undefined for people who name-match nothing in the roster. */
  actorSlug?: string;
  category: MentionCategory;
  /** Translated "in a reply" / "in an article comment" / … descriptor. */
  context: ReactNode;
  when: string;
  fresh?: boolean;
  unread?: boolean;
  content: ReactNode;
  whereText: string;
  /** Route to the source; omitted for private/no-link sources. */
  whereTo?: string;
  actions: MentionAction[];
}

