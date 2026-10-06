import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BlockOptions } from "../social/api/social.api";
import { useBlockMatchedChatMember } from "./api/useBlockMatchedChatMember";

/**
 * PRD-423: the roster row's Block inside a matched Go together chat, where a
 * member is named by their per-chat key and blocked through
 * `useBlockMatchedChatMember`. Same shape as `useConversationBlockAction`'s
 * block half, so `GroupMemberRowSafetyMenu` swaps one for the other. A key
 * never reads as blocked locally (the block list is keyed by slug), so the
 * row always offers Block, which the server answers idempotently.
 */
export function useMatchedChatMemberBlockAction(
  conversationId: string | null,
  memberKey: string,
  name: string,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const blockMatchedChatMember = useBlockMatchedChatMember();
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmBlock = (options: BlockOptions) => {
    setIsConfirming(false);
    if (!conversationId || !memberKey) return;
    blockMatchedChatMember(
      conversationId,
      memberKey,
      (didSucceed) => {
        if (!didSucceed) {
          showToast(t("shared:social.blockError"), "error");
          return;
        }
        showToast(
          t(
            options.alsoReport
              ? "safety:profileMenu.blockedReportedToast"
              : "safety:profileMenu.blockedToast",
            { name },
          ),
          "success",
        );
      },
      options,
    );
  };

  return {
    blocked: false,
    confirmingBlock: isConfirming,
    beginBlock: () => setIsConfirming(true),
    cancelBlock: () => setIsConfirming(false),
    confirmBlock,
  };
}
