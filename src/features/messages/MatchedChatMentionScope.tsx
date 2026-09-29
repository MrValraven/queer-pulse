import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { InertMemberMentionsContext } from "../../shared/mentions/MentionLinkPolicyContext";
import { MentionMemberScopeContext } from "../../shared/mentions/MentionMemberScopeContext";
import {
  MentionNamesContext,
  useMentionNameMap,
} from "../../shared/mentions/MentionNamesContext";
import { getMentionNames } from "../../shared/mentions/mentionNames.api";
import { mentionNameKey } from "../../shared/mentions/mentionNameKey";
import { mentionRefsIn } from "../../shared/mentions/mentionRefs";
import type { Suggestion } from "../../shared/mentions/useMentionSuggestions";
import { MatchedChatContext, type MatchedChat } from "./matchedChatContext";
import { realConversationId } from "./useMessagesController.helpers";
import { useMessageViewer } from "./useMessageViewer";
import type { ChatMessage, Conversation } from "./data";

/** Matches the page-level resolver's cache lifetime for display names. */
const NAME_STALE_TIME_MS = 5 * 60_000;

interface MatchedChatMentionScopeProps {
  active: Conversation;
  messageGroups: { day: string; items: ChatMessage[] }[];
  children: ReactNode;
}

/**
 * PRD-423: inside a matched Go together chat, mentions follow the chat's own
 * first-name rule. A mention of a member renders under the first name the
 * roster shows, and the composer's `@` picker offers the chat's members
 * alone, by first name. Member mention chips and group info roster rows
 * render as plain text there and open no profile (`MatchedChatContext`).
 * Gated on `isGoTogetherChat`, which stays true for the life of the chat even
 * after its group is deleted and `eventMatchGroupId` goes null, so those
 * rules never lapse back to a full name or a profile link. Every other
 * thread renders its children untouched.
 */
export function MatchedChatMentionScope({
  active,
  messageGroups,
  children,
}: MatchedChatMentionScopeProps) {
  if (!active.isGoTogetherChat) return <>{children}</>;
  return (
    <MatchedChatMentionScopeActive
      active={active}
      messageGroups={messageGroups}
    >
      {children}
    </MatchedChatMentionScopeActive>
  );
}

function MatchedChatMentionScopeActive({
  active,
  messageGroups,
  children,
}: MatchedChatMentionScopeProps) {
  const parentNames = useMentionNameMap();
  const serverNames = useMatchedChatServerNames(active, messageGroups);
  const { myHandle } = useMessageViewer();
  const members = active.members;

  const nameMap = useMemo(() => {
    const scopedNames = new Map(parentNames);
    // The server's answer covers a mention of someone who has since left the
    // roster; the roster itself wins for everyone still in the chat.
    for (const [key, name] of serverNames) scopedNames.set(key, name);
    for (const member of members ?? []) {
      if (member.slug) {
        scopedNames.set(mentionNameKey("member", member.slug), member.name);
      }
    }
    return scopedNames;
  }, [parentNames, serverNames, members]);

  const memberSuggestions = useMemo<Suggestion[]>(
    () =>
      (members ?? []).flatMap((member) =>
        member.slug && member.slug !== myHandle
          ? [
              {
                kind: "member" as const,
                slug: member.slug,
                name: member.name,
                avatarUrl: member.avatarUrl,
                initials: member.initials,
              },
            ]
          : [],
      ),
    [members, myHandle],
  );

  // `groupId` is only for the paths that need a real group to act on (the
  // sheet, the safety button): it goes null once the group row is deleted,
  // while `isGoTogetherChat` (checked above, to even reach this component)
  // stays true, so the roster/mention rules it drives never lapse.
  const groupId = active.eventMatchGroupId ?? null;
  const conversationId = active.id;
  const matchedChat = useMemo<MatchedChat>(
    () => ({ groupId, conversationId }),
    [groupId, conversationId],
  );

  // Round 1b: the chat also opens no member's profile, from a mention chip
  // or the group info roster, since the profile carries the full name.
  return (
    <MatchedChatContext.Provider value={matchedChat}>
      <InertMemberMentionsContext.Provider value={true}>
        <MentionNamesContext.Provider value={nameMap}>
          <MentionMemberScopeContext.Provider value={memberSuggestions}>
            {children}
          </MentionMemberScopeContext.Provider>
        </MentionNamesContext.Provider>
      </InertMemberMentionsContext.Provider>
    </MatchedChatContext.Provider>
  );
}

/** Live mode: the first names the server gives this chat's member mentions,
 *  keyed `member:slug`. Empty in demo mode, where the roster names them. */
function useMatchedChatServerNames(
  active: Conversation,
  messageGroups: { day: string; items: ChatMessage[] }[],
): ReadonlyMap<string, string> {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const conversationId = realConversationId(active);
  const refs = useMemo(
    () =>
      mentionRefsIn(
        messageGroups
          .flatMap((group) =>
            group.items.flatMap((item) => [item.text, item.replyTo?.snippet]),
          )
          .filter(Boolean)
          .join("\n"),
      ).filter((ref) => ref.startsWith("member:")),
    [messageGroups],
  );
  const { data } = useQuery({
    queryKey: ["mention-names", conversationId, refs],
    queryFn: ({ signal }) =>
      getMentionNames(refs, signal, conversationId ?? undefined),
    enabled:
      !demoMode &&
      loggedIn &&
      !checking &&
      conversationId !== null &&
      refs.length > 0,
    staleTime: NAME_STALE_TIME_MS,
  });
  return useMemo(() => {
    const names = new Map<string, string>();
    for (const resolved of data ?? []) {
      names.set(mentionNameKey(resolved.kind, resolved.slug), resolved.name);
    }
    return names;
  }, [data]);
}
