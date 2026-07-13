import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import type { ChatMessage } from "../data";
import { getMessages, type MessageResponse } from "./messages.api";
import { groupMessages } from "./messages.adapters";

interface MessagePage {
  items: MessageResponse[];
  nextCursor: string | null;
}

/**
 * Message history for one conversation, cursor-paginated (load-older on scroll-
 * up). Demo mode is inert here — the panel renders the mock `Conversation.messages`
 * groups directly — so this only drives live mode. Returns messages grouped into
 * the `{ day, items }[]` shape ConversationPanel already renders.
 */
export function useMessageThread(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const myHandle = user?.profile.slug ?? null;

  const query = useInfiniteQuery<MessagePage>({
    queryKey: ["messages", conversationId, demoMode],
    enabled: !demoMode && !!conversationId,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await getMessages(
        conversationId!,
        pageParam as string | undefined,
      );
      return { items: res.data, nextCursor: res.pageInfo.nextCursor };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  // Pages arrive newest-first per page; flatten oldest→newest for display.
  const groups = useMemo(() => {
    const flat = (query.data?.pages ?? [])
      .flatMap((p) => p.items)
      .slice()
      .reverse();
    return groupMessages(flat, myHandle);
  }, [query.data, myHandle]);

  return {
    ...query,
    groups: groups as { day: string; items: ChatMessage[] }[],
  };
}
