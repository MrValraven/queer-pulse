// src/features/messages/useConversationBlockAction.ts
import { useState } from "react";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BlockOptions } from "../social/api/social.api";

/**
 * Block/unblock-from-a-conversation state + confirm/undo flow, extracted out
 * of `ConversationSafetyMenu` to keep it under the component size cap.
 * `toggleBlock` (from `useSocial`) is the same dual-mode primitive
 * `ProfileSafetyMenu` uses — demo flips a local store, live POSTs/DELETEs
 * `/blocks/:slug` and invalidates the conversations list + unread badge (see
 * `SocialProvider`), so the thread disappears from the inbox and the
 * composer severs without a reload.
 */
export function useConversationBlockAction(slug: string, name: string) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isBlocked, toggleBlock } = useSocial();
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const blocked = isBlocked(slug);

  const undoBlock = () => {
    toggleBlock(slug);
    showToast(t("safety:profileMenu.unblockedToast", { name }), "success");
  };

  const beginBlock = () => {
    if (blocked) {
      toggleBlock(slug);
      showToast(t("safety:profileMenu.unblockedToast", { name }), "success");
      return;
    }
    setConfirmingBlock(true);
  };

  const confirmBlock = (options: BlockOptions) => {
    setConfirmingBlock(false);
    toggleBlock(slug, options);
    // A block severs the composer instantly and drops the thread from the
    // inbox — offer a quick way back before either sticks, mirroring
    // `blockMute.blocked.undoCta`'s "Undo — unblock {name}" affordance.
    showToast(
      t(
        options.alsoReport
          ? "safety:profileMenu.blockedReportedToast"
          : "safety:profileMenu.blockedToast",
        { name },
      ),
      "success",
      6000,
      { label: t("safety:blockMute.blocked.undoCta", { name }), onClick: undoBlock },
    );
  };

  return {
    blocked,
    confirmingBlock,
    beginBlock,
    cancelBlock: () => setConfirmingBlock(false),
    confirmBlock,
  };
}
