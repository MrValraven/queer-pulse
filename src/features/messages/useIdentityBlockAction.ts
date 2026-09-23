// src/features/messages/useIdentityBlockAction.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { IdentityKind } from "../../shared/contracts/contracts";
import {
  useBlockIdentity,
  useUnblockIdentity,
} from "../social/api/useIdentityBlocks";

/** Enough of the counterpart identity to confirm, block and toast about it. */
export interface IdentityBlockActionTarget {
  identityId: string;
  kind: IdentityKind;
  /** Full display name ("Café Lisboa"), used in every confirm/toast string. */
  name: string;
  handle?: string | null;
  avatarUrl?: string | null;
}

/**
 * Block a business, persona or company from inside its thread
 * (`ConversationMenu`'s identity block item, customer's view only). Shaped
 * on `useConversationBlockAction`'s confirm-then-undo flow, but through
 * `/identity-blocks` and with a single confirm step: a business thread's
 * report is its own separate menu item (`mailbox.report.action`), kept out
 * of this confirm entirely. This flow has no equivalent to the person flow's
 * "report messages first" step.
 *
 * A block closes the thread for both sides (spec section 9), so a
 * successful block leaves the now-closed thread behind and returns to the
 * inbox, the one view with something left to show.
 */
export function useIdentityBlockAction(
  target: IdentityBlockActionTarget | undefined,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const blockIdentityMutation = useBlockIdentity();
  const unblockIdentityMutation = useUnblockIdentity();

  const beginBlock = () => setIsConfirming(true);
  const cancelBlock = () => setIsConfirming(false);

  const undoBlock = () => {
    if (!target) return;
    unblockIdentityMutation.mutate(target.identityId, {
      onSuccess: () => {
        showToast(
          t("messages:mailbox.blocked.unblocked", { name: target.name }),
          "success",
        );
      },
      onError: () => {
        showToast(t("messages:mailbox.block.error"), "error");
      },
    });
  };

  const confirmBlock = () => {
    if (!target) return;
    blockIdentityMutation.mutate(
      {
        identityId: target.identityId,
        kind: target.kind,
        displayName: target.name,
        handle: target.handle,
        avatarUrl: target.avatarUrl,
      },
      {
        onSuccess: () => {
          setIsConfirming(false);
          showToast(
            t("messages:mailbox.block.done", { name: target.name }),
            "success",
            undefined,
            {
              label: t("messages:mailbox.block.undo"),
              onClick: undoBlock,
            },
          );
          // The thread just closed for both sides; nothing is left to show.
          void navigate(routes.messages);
        },
        onError: () => {
          setIsConfirming(false);
          showToast(t("messages:mailbox.block.error"), "error");
        },
      },
    );
  };

  return {
    isConfirming,
    isBlocking: blockIdentityMutation.isPending,
    beginBlock,
    cancelBlock,
    confirmBlock,
  };
}
