import { memo, useRef } from "react";
import { FiBellOff, FiHeart } from "react-icons/fi";
import { TbPinnedFilled } from "react-icons/tb";
import { Avatar } from "../../shared/components/ui";
import { useIsOnline } from "../../shared/api/realtime";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import {
  useToggleFavorite,
  useToggleMute,
  useTogglePin,
} from "./api/useConversationPrefs";
import { ThreadRowMenu } from "./ThreadRowMenu";
import { ThreadRowSwipeAffordances } from "./ThreadRowSwipeAffordances";
import { isThreadUnread } from "./threadFilters";
import { useThreadRowSwipe } from "./useThreadRowSwipe";
import { useThreadRowTimeLabel } from "./useThreadRowTimeLabel";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface MessagesThreadRowProps {
  thread: Conversation;
  activeId: string;
  readIds: Set<string>;
  /** Total pinned chats across the inbox right now — the pin-toggle mutation
   *  caps at 3, computed here (excluding this row when it's already pinned). */
  pinnedCount: number;
  onOpen: (id: string) => void;
  onRequestDelete: (thread: Conversation) => void;
}

/**
 * One inbox row: a `.threadRowSwipeContainer` (the two swipe affordance
 * layers + the row `<button>` itself, avatar + body markup unchanged) plus a
 * sibling `<ThreadRowMenu>` — split out of `MessagesThreadList` to keep each
 * component under the 200-line cap.
 *
 * Mobile swipe (touch/pen only, via `useThreadRowSwipe`): swipe right toggles
 * Pin, swipe left toggles Favorite — the SAME `useTogglePin`/`useToggleFavorite`
 * mutations the ⋯ menu calls (`handleTogglePin`/`handleToggleFavorite` below
 * are shared by both paths). Delete stays ⋯-menu-only (destructive, has its
 * own confirm dialog). The gesture writes the row's follow-transform and the
 * two affordance icons' opacity/scale straight to the DOM on every
 * `pointermove` — it never touches React state per frame, so a swipe in
 * progress never re-renders this row's avatar/badges/indicators.
 *
 * Wrapped in `React.memo`: subscribes to presence via `useIsOnline` itself
 * (a per-participant selector, not the whole online set) so a row only
 * re-renders on its OWN presence flip, and every other prop here is already a
 * primitive or a stable callback — so an unrelated row's presence change, or
 * an unrelated re-render of the list above, skips this row entirely.
 */
function MessagesThreadRowImpl({
  thread,
  activeId,
  readIds,
  pinnedCount,
  onOpen,
  onRequestDelete,
}: MessagesThreadRowProps) {
  const { t } = useTranslation();
  const isUnread = isThreadUnread(thread, activeId, readIds);
  const presenceOnline = useIsOnline(thread.otherParticipantId);
  const isOnline =
    (!!thread.otherParticipantId && presenceOnline) ||
    (!thread.otherParticipantId && !!thread.online);
  const isPinned = !!thread.pinnedAt;
  const isFavorite = !!thread.favorite;
  const isMuted = !!thread.muted;
  const togglePin = useTogglePin();
  const toggleFavorite = useToggleFavorite();
  const toggleMute = useToggleMute();
  const displayedTime = useThreadRowTimeLabel(thread.time, thread.updatedAt);

  // Shared by BOTH the ⋯ menu items and the mobile swipe gesture below — one
  // toggle callback per action, never two paths computing the same mutation.
  const handleTogglePin = () =>
    togglePin.mutate({
      conversationId: thread.id,
      pinned: isPinned,
      otherPinnedCount: pinnedCount - (isPinned ? 1 : 0),
    });
  const handleToggleFavorite = () =>
    toggleFavorite.mutate({ conversationId: thread.id, favorite: isFavorite });
  const handleToggleMute = () =>
    toggleMute.mutate({ conversationId: thread.id, muted: isMuted });

  const rowRef = useRef<HTMLButtonElement>(null);
  const leadingIconRef = useRef<HTMLSpanElement>(null);
  const trailingIconRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const swipe = useThreadRowSwipe({
    enabled: true,
    onSwipePin: handleTogglePin,
    onSwipeFavorite: handleToggleFavorite,
    rowRef,
    leadingIconRef,
    trailingIconRef,
    reducedMotion,
  });

  return (
    <div className={styles.threadRowWrap}>
      <div className={styles.threadRowSwipeContainer}>
        <ThreadRowSwipeAffordances
          leadingIconRef={leadingIconRef}
          trailingIconRef={trailingIconRef}
        />
        <button
          ref={rowRef}
          type="button"
          className={[
            styles.threadRow,
            thread.id === activeId && styles.threadActive,
            swipe.swiping && styles.threadRowSwiping,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            // An engaged swipe already toggled pin/favorite on release —
            // don't also open the thread underneath it.
            if (swipe.consumeSwipeClick()) return;
            onOpen(thread.id);
          }}
          {...swipe.handlers}
        >
          <div className={styles.trAv}>
            <Avatar
              initials={thread.initials}
              tint={thread.tint}
              src={thread.avatarUrl}
              size={42}
            />
            {isOnline && (
              <span
                className={styles.presenceRing}
                title={t("messages:thread.presenceOnline")}
              />
            )}
          </div>
          <div className={styles.trBody}>
            <div className={styles.trHeader}>
              <span className={styles.nameRow}>
                <span className={styles.trName}>{thread.name}</span>
                <MemberStaffBadge slug={thread.slug} />
              </span>
              <span className={styles.trIndicators}>
                {isMuted && (
                  <span
                    className={styles.trMutedIcon}
                    title={t("messages:thread.mutedIndicator")}
                  >
                    <FiBellOff aria-hidden />
                  </span>
                )}
                {isFavorite && (
                  <span
                    className={styles.trFavoriteIcon}
                    title={t("messages:thread.favoriteIndicator")}
                  >
                    <FiHeart aria-hidden />
                  </span>
                )}
                {isPinned && (
                  <span
                    className={styles.trPinnedIcon}
                    title={t("messages:thread.pinnedIndicator")}
                  >
                    <TbPinnedFilled aria-hidden />
                  </span>
                )}
                <span className={styles.trTime}>{displayedTime}</span>
              </span>
            </div>
            <div className={styles.trPreviewRow}>
              <div
                className={[
                  styles.trPreview,
                  isUnread && styles.trPreviewUnread,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {thread.preview}
              </div>
              {isUnread &&
                (thread.unreadCount && thread.unreadCount > 0 ? (
                  <span className={styles.unreadBadge}>
                    {thread.unreadCount}
                  </span>
                ) : (
                  <span className={styles.unreadDot} />
                ))}
            </div>
          </div>
        </button>
      </div>
      <ThreadRowMenu
        thread={thread}
        onTogglePin={handleTogglePin}
        onToggleFavorite={handleToggleFavorite}
        onToggleMute={handleToggleMute}
        onDelete={() => onRequestDelete(thread)}
      />
    </div>
  );
}

/**
 * Every row in the list is handed the SAME `activeId` string and the SAME
 * `readIds` Set reference — switching the open thread, or marking any ONE
 * thread read, hands every row a new `readIds` Set identity, which the
 * default shallow-props memo comparator would see as "changed" for every
 * row, not just the one whose own state actually flipped. Compare the two
 * DERIVED booleans this row actually renders from instead of the raw
 * props, so a row only re-renders when its OWN active/read state changes
 * (or its own `thread`/callback identities do) — not on every other row's.
 * (Not a prop-shape refactor — `activeId`/`readIds` stay as-is so this
 * doesn't ripple into `MessagesSearchResults.tsx`'s call site.)
 *
 * `thread` is a fresh object reference whenever ITS OWN `pinnedAt`/`favorite`
 * changes (`patchConversationPinned`/`patchConversationFavorite` only replace
 * the matching row), so that's already covered by the `thread !==` check
 * below. `pinnedCount` is compared explicitly because it's inbox-wide: pinning
 * ANY row patches only that one row's object, leaving every OTHER row's
 * `thread` reference (and therefore the default check) unchanged even though
 * their own cap-check input just moved.
 */
function areRowPropsEqual(
  previous: MessagesThreadRowProps,
  next: MessagesThreadRowProps,
): boolean {
  if (previous.thread !== next.thread) return false;
  if (previous.pinnedCount !== next.pinnedCount) return false;
  if (previous.onOpen !== next.onOpen) return false;
  if (previous.onRequestDelete !== next.onRequestDelete) return false;
  const wasActive = previous.thread.id === previous.activeId;
  const isActive = next.thread.id === next.activeId;
  if (wasActive !== isActive) return false;
  const wasRead = previous.readIds.has(previous.thread.id);
  const isRead = next.readIds.has(next.thread.id);
  return wasRead === isRead;
}

export const MessagesThreadRow = memo(MessagesThreadRowImpl, areRowPropsEqual);
