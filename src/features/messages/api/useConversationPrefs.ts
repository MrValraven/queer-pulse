import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  patchConversationFavorite,
  patchConversationPinned,
} from "../../../shared/api/messageCache";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { writeConversationPrefOverride } from "../conversationPrefs";
import { updateConversationPrefs } from "./messages.api";

/**
 * Pin-to-top / favorite a CHAT (WhatsApp-style, CONVERSATION-scoped) — distinct
 * from the existing message-level pin/star in `useMessagePinStar.ts`. Both
 * branch on `demoMode`: live mode PATCHes `/conversations/:id` then
 * optimistically patches the `["conversations", …]` cache and invalidates it
 * (never a blanket refetch of every query); DEMO mode has no server, but demo
 * conversations DO carry stable ids, so the toggle patches the cache AND
 * writes through to `conversationPrefs.ts` (session-persisted) instead of
 * being an inert no-op.
 */

/** Server-enforced cap on pinned chats, mirrored client-side so an over-cap
 *  pin never even fires the request. */
export const PIN_CAP = 3;

class PinCapError extends Error {}

function isPinCapError(error: unknown): boolean {
  return (
    error instanceof PinCapError ||
    (error instanceof ApiError && error.status === 409)
  );
}

export interface TogglePinInput {
  conversationId: string;
  /** Whether this chat is currently pinned — decides pin vs. unpin. */
  pinned: boolean;
  /** Count of OTHER pinned chats right now (excludes this one) — enforces the
   *  3-pin cap before firing; ignored when un-pinning. */
  otherPinnedCount: number;
}

/** Pin/unpin a chat to the top of the inbox. */
export function useTogglePin() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  return useMutation<void, Error, TogglePinInput>({
    mutationFn: async ({ conversationId, pinned, otherPinnedCount }) => {
      if (!pinned && otherPinnedCount >= PIN_CAP) throw new PinCapError();
      if (demoMode) {
        writeConversationPrefOverride(conversationId, {
          pinnedAt: pinned ? undefined : new Date().toISOString(),
        });
        return;
      }
      await updateConversationPrefs(conversationId, { pinned: !pinned });
    },
    onSuccess: (_result, { conversationId, pinned }) => {
      patchConversationPinned(
        queryClient,
        conversationId,
        pinned ? undefined : new Date().toISOString(),
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
    onError: (error) => {
      if (isPinCapError(error)) {
        showToast(t("messages:thread.pinCapReached"), "error");
      }
    },
  });
}

export interface ToggleFavoriteInput {
  conversationId: string;
  /** Whether this chat is currently a favorite — decides favorite vs. unfavorite. */
  favorite: boolean;
}

/** Favorite/unfavorite a chat (drives the Favorites inbox tab). */
export function useToggleFavorite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleFavoriteInput>({
    mutationFn: async ({ conversationId, favorite }) => {
      if (demoMode) {
        writeConversationPrefOverride(conversationId, { favorite: !favorite });
        return;
      }
      await updateConversationPrefs(conversationId, { favorite: !favorite });
    },
    onSuccess: (_result, { conversationId, favorite }) => {
      patchConversationFavorite(queryClient, conversationId, !favorite);
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });
}
