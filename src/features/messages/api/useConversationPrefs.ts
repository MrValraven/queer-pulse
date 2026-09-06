import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  patchConversationFavorite,
  patchConversationMarkedUnread,
  patchConversationMuted,
  patchConversationPinned,
} from "../../../shared/api/messageCache";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Conversation } from "../data";
import { writeConversationPrefOverride } from "../conversationPrefs";
import { updateConversationPrefs } from "./messages.api";

/**
 * Patches `archivedAt` onto a cached inbox row in place — `useToggleArchive`'s
 * optimistic update in both demo and live mode. A no-op if the row isn't
 * cached. Kept local (rather than added to `shared/api/messageCache.ts`
 * alongside its `pinnedAt`/`favorite`/`muted` siblings) purely because that
 * shared file sits outside this change's file ownership for this build pass;
 * a follow-up cleanup could move it there to match the others exactly.
 */
function patchConversationArchived(
  queryClient: QueryClient,
  conversationId: string,
  archivedAt: string | undefined,
): void {
  queryClient.setQueriesData<Conversation[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, archivedAt }
          : conversation,
      ),
  );
}

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

export interface ToggleMuteInput {
  conversationId: string;
  /** Whether this chat is currently muted — decides mute vs. unmute. */
  muted: boolean;
}

/** Mute/unmute a chat's push notifications (any thread — DM or group). */
export function useToggleMute() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleMuteInput>({
    mutationFn: async ({ conversationId, muted }) => {
      if (demoMode) {
        writeConversationPrefOverride(conversationId, { muted: !muted });
        return;
      }
      await updateConversationPrefs(conversationId, { muted: !muted });
    },
    onSuccess: (_result, { conversationId, muted }) => {
      patchConversationMuted(queryClient, conversationId, !muted);
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });
}

export interface ToggleArchiveInput {
  conversationId: string;
  /** Whether this chat is currently archived — decides archive vs. unarchive. */
  archived: boolean;
}

/**
 * Archive/unarchive a chat (SOC-16) — the reversible, everyday way to
 * declutter the inbox, replacing destructive clear-for-me for that purpose
 * (clear-for-me itself is unchanged and still available for its own,
 * genuinely destructive, meaning). Mirrors `useToggleMute` exactly: live mode
 * PATCHes `/conversations/:id`, demo mode writes through to
 * `conversationPrefs.ts`. The server independently unarchives a conversation
 * for every participant the instant a new message lands — this mutation only
 * ever fires from an explicit member action (the row menu / thread header).
 */
export function useToggleArchive() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleArchiveInput>({
    mutationFn: async ({ conversationId, archived }) => {
      if (demoMode) {
        writeConversationPrefOverride(conversationId, {
          archivedAt: archived ? undefined : new Date().toISOString(),
        });
        return;
      }
      await updateConversationPrefs(conversationId, { archived: !archived });
    },
    onSuccess: (_result, { conversationId, archived }) => {
      patchConversationArchived(
        queryClient,
        conversationId,
        archived ? undefined : new Date().toISOString(),
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });
}

export interface ToggleMarkUnreadInput {
  conversationId: string;
  /** Whether this chat is currently manually marked unread — decides
   *  mark-unread vs. clear. Always `false` when called from the row menu
   *  (there's no "mark read" entry — reopening the thread is what clears it,
   *  via `useMarkRead`/`patchConversationRead`), but kept symmetric with the
   *  other toggles here for the same optimistic-patch shape. */
  markedUnread: boolean;
}

/**
 * Mark/unmark a chat unread from the row menu (PRD-225) — a WhatsApp/
 * Telegram/Signal-style "come back to this" flag. Mirrors `useToggleArchive`
 * exactly: live mode PATCHes `/conversations/:id`, demo mode writes through
 * to `conversationPrefs.ts`. Deliberately does NOT touch `unreadCount` or the
 * read watermark — only `ConversationsService.markRead` (a genuine re-open)
 * ever clears this, so the row can't silently flip back to "read" on its own
 * re-render.
 */
export function useToggleMarkUnread() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleMarkUnreadInput>({
    mutationFn: async ({ conversationId, markedUnread }) => {
      if (demoMode) {
        writeConversationPrefOverride(conversationId, {
          markedUnreadAt: markedUnread ? undefined : new Date().toISOString(),
        });
        return;
      }
      await updateConversationPrefs(conversationId, {
        markUnread: !markedUnread,
      });
    },
    onSuccess: (_result, { conversationId, markedUnread }) => {
      patchConversationMarkedUnread(
        queryClient,
        conversationId,
        markedUnread ? undefined : new Date().toISOString(),
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });
}
