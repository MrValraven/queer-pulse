import { createContext, useContext } from "react";

/**
 * Whether `MentionText` renders a `@member` mention as plain text with no
 * link to that member's profile. `false` (the default) links as always. A
 * matched Go together chat (PRD-423) sets it, so a mention there shows the
 * first name the chat uses and opens no profile carrying the full name.
 */
export const InertMemberMentionsContext = createContext(false);

/** True when `@member` mentions render as plain, non-interactive text. */
export function useIsMemberMentionInert(): boolean {
  return useContext(InertMemberMentionsContext);
}
