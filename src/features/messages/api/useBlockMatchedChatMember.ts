import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSocial } from "../../../app/providers/useSocial";
import { logError } from "../../../shared/observability/logger";
import type { BlockOptions } from "../../social/api/social.api";
import { blockMatchedChatMember } from "./messages.api";
import { UNREAD_COUNT_KEY } from "./useConversations";

/**
 * PRD-423: blocks a member of a matched Go together chat by the per-chat
 * member key the chat names them by (the report sheet's "also block", and a
 * roster row's Block). Live mode goes through
 * `POST /conversations/:id/members/:memberKey/block`, which resolves the key
 * inside that conversation alone, then refreshes what a block changes, as
 * `toggleBlock` does for a slug. Demo mode has no server to resolve a key,
 * so it records the key in the local social store, the same place every
 * other demo block lands.
 */
export function useBlockMatchedChatMember(): (
  conversationId: string,
  memberKey: string,
  onSettled: (didSucceed: boolean) => void,
  options?: BlockOptions,
) => void {
  const { demoMode } = useDemoMode();
  const { isBlocked, toggleBlock } = useSocial();
  const queryClient = useQueryClient();
  return useCallback(
    (conversationId, memberKey, onSettled, options) => {
      if (demoMode) {
        // `toggleBlock` toggles: a key already blocked would unblock, so a
        // repeat block settles as done, as the live route answers it.
        if (isBlocked(memberKey)) {
          onSettled(true);
          return;
        }
        toggleBlock(memberKey, options, onSettled);
        return;
      }
      blockMatchedChatMember(conversationId, memberKey, options).then(
        () => {
          for (const queryKey of [
            ["blocks"],
            ["connections"],
            ["conversations"],
            ["conversation-detail"],
            [UNREAD_COUNT_KEY],
            ["messages", conversationId],
            ["mention-names"],
          ]) {
            void queryClient.invalidateQueries({ queryKey });
          }
          onSettled(true);
        },
        (error: unknown) => {
          logError(error, { scope: "messages.blockMatchedChatMember" });
          onSettled(false);
        },
      );
    },
    [demoMode, isBlocked, toggleBlock, queryClient],
  );
}
