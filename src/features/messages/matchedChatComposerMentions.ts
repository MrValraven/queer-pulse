import { createContext, useContext } from "react";
import type { Suggestion } from "../../shared/mentions/useMentionSuggestions";
import { MATCHED_MEMBER_MENTION } from "./matchedChatMentionText";

/**
 * PRD-423: how a matched Go together chat's composer shows member mentions.
 * The chat stores a mention as an opaque `@<member key>` token; its composer
 * shows `@FirstName` while the member types, and turns it back into the key
 * token on send. Two members who share a first name read as `@Sofia` and
 * `@Sofia (2)`, in roster order, so every display name maps to exactly one
 * key. Non-matched chats never see this (no provider, so the composers keep
 * inserting `@slug`).
 */
export interface MatchedChatComposerMentions {
  /** The text `MentionTextarea` inserts for a picked member. */
  formatInsertedMember: (item: Suggestion) => string;
  /** Display text to stored text: `@FirstName` tokens become key tokens. */
  encode: (displayText: string) => string;
  /** Stored text to display text, for seeding an edit or a draft. */
  decode: (storedText: string) => string;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds the display map from the chat's roster (`member.slug` holds the
 * per-chat key there). Display names are `@` plus the first word of the
 * roster name, numbered from the second member sharing one.
 */
export function buildMatchedChatComposerMentions(
  members: ReadonlyArray<{ slug?: string; name: string }>,
): MatchedChatComposerMentions {
  const displayByKey = new Map<string, string>();
  const countByFirstName = new Map<string, number>();
  for (const member of members) {
    if (!member.slug || displayByKey.has(member.slug)) continue;
    const firstName = member.name.trim().split(/\s+/)[0] || member.name;
    const seen = (countByFirstName.get(firstName.toLowerCase()) ?? 0) + 1;
    countByFirstName.set(firstName.toLowerCase(), seen);
    displayByKey.set(
      member.slug,
      seen === 1 ? `@${firstName}` : `@${firstName} (${seen})`,
    );
  }
  // Longest first, so `@Sofia (2)` is taken before `@Sofia` can match it.
  const encodeRules = [...displayByKey]
    .sort(([, left], [, right]) => right.length - left.length)
    .map(([memberKey, display]) => ({
      memberKey,
      pattern: new RegExp(
        `(^|\\s)${escapeRegExp(display)}(?=$|[^\\p{L}\\p{N}_-])`,
        "gu",
      ),
    }));
  return {
    formatInsertedMember: (item) =>
      displayByKey.get(item.slug) ?? `@${item.slug}`,
    encode: (displayText) =>
      encodeRules.reduce(
        (text, { memberKey, pattern }) =>
          text.replace(pattern, (_token, boundary: string) => {
            return `${boundary}@${memberKey}`;
          }),
        displayText,
      ),
    decode: (storedText) =>
      storedText.replace(
        MATCHED_MEMBER_MENTION,
        (token, boundary: string, memberKey: string) => {
          const display = displayByKey.get(memberKey);
          return display ? `${boundary}${display}` : token;
        },
      ),
  };
}

/** Set inside an open matched Go together chat by `MatchedChatMentionScope`,
 *  null everywhere else. */
export const MatchedChatComposerMentionsContext =
  createContext<MatchedChatComposerMentions | null>(null);

/** The surrounding matched chat's composer mention mapping, or null. */
export function useMatchedChatComposerMentions(): MatchedChatComposerMentions | null {
  return useContext(MatchedChatComposerMentionsContext);
}

/**
 * The text a composer's `displayText` is sent as: its key-token form inside
 * a matched Go together chat, unchanged elsewhere. Length limits measure
 * this, since the server counts the stored text.
 */
export function useStoredMessageBody(displayText: string): string {
  const composerMentions = useMatchedChatComposerMentions();
  return composerMentions ? composerMentions.encode(displayText) : displayText;
}

/**
 * The display-text cap for a field whose stored text may hold at most
 * `storedMaxLength` characters. Inside a matched Go together chat every
 * `@FirstName` is stored as a longer key token, so the cap shrinks by that
 * difference and a mention-heavy text is stopped in the field itself, as the
 * server would refuse it. Unchanged elsewhere.
 */
export function useDisplayMaxLength(
  displayText: string,
  storedMaxLength: number,
): number {
  const storedText = useStoredMessageBody(displayText);
  return storedMaxLength - (storedText.length - displayText.length);
}
