import { createContext, useContext } from "react";
import type { Suggestion } from "./useMentionSuggestions";

/**
 * The members a `MentionTextarea` offers after `@`, when a surface narrows
 * them to its own roster. `null` (the default) keeps the whole member
 * directory. A matched Go together chat (PRD-423) sets it to the chat's own
 * members, named by first name, so the picker suggests the people in the
 * chat under the names the chat already shows.
 */
export const MentionMemberScopeContext = createContext<
  readonly Suggestion[] | null
>(null);

/** The scoped member suggestions, or `null` for the whole directory. */
export function useMentionMemberScope(): readonly Suggestion[] | null {
  return useContext(MentionMemberScopeContext);
}
