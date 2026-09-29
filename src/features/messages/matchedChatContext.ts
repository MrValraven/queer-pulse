import { createContext, useContext } from "react";

/** The open matched Go together chat: its conversation, and its group when
 *  one can still be read. `groupId` is null once the group row is deleted;
 *  the chat stays a matched chat (`isGoTogetherChat`), it just has nothing
 *  left to open a sheet or safety action against. */
export interface MatchedChat {
  groupId: string | null;
  conversationId: string;
}

/**
 * Set inside an open matched Go together chat (`isGoTogetherChat` true),
 * provided by `MatchedChatMentionScope`; null in every other thread. This
 * stays set for the life of the chat, even after its group is deleted and
 * `eventMatchGroupId` goes null, so the roster/mention rules below never
 * regress to showing a full name or a profile link. In a matched chat the
 * group info roster shows each member as plain first-name text (PRD-423),
 * since a profile carries the full name, and its Block and Report go through
 * the Go together group sheet while a group can still be read.
 */
export const MatchedChatContext = createContext<MatchedChat | null>(null);

/** Whether the surrounding thread is a matched Go together chat. */
export function useIsMatchedChat(): boolean {
  return useContext(MatchedChatContext) !== null;
}

/** The surrounding matched Go together chat, or null outside one. */
export function useMatchedChat(): MatchedChat | null {
  return useContext(MatchedChatContext);
}
