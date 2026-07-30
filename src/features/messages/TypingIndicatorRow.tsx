// src/features/messages/TypingIndicatorRow.tsx
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { resolveGroupTypingLabel } from "./groupReceipts";
import { useTypingIndicator } from "./useTypingIndicator";
import type { RunParticipant } from "./MessageRun";
import type { GroupMemberView } from "./data";
import styles from "./MessagesPage.module.css";

/** How long the row stays mounted (fading out) after typing stops before it's
 *  actually removed from the DOM — mirrors `--dur-base` (see
 *  `styles.tokens/effects.css`), the CSS transition this waits out. */
const TYPING_FADE_OUT_MS = 250;

export interface TypingIndicatorRowProps {
  conversationId: string;
  counterpart: RunParticipant;
  counterpartName: string;
  isGroup?: boolean;
  /** GROUP roster, used to resolve the aggregated typing label. Absent for DMs. */
  members?: GroupMemberView[];
}

/**
 * The in-list typing bubble — styled as an incoming bubble on the left (same
 * avatar + alignment as a received run), rendered at the very bottom of the
 * log so it grows the content and `useMessageScroll`'s ResizeObserver keeps a
 * pinned reader anchored to it.
 *
 * Subscribes to `useTypingIndicator` INTERNALLY (rather than receiving typing
 * state as a prop) so a typing frame re-renders only this small leaf, never
 * `ConversationPanel`/`MessageArea` and the rest of the message log above it.
 *
 * Stays mounted for a short fade-out after typing stops, instead of
 * unmounting instantly: on a flaky connection the signal can flicker on/off
 * within a couple of seconds, and unmounting would replay BOTH the row's own
 * entrance animation and restart the three-dot bounce loop from its first
 * frame every time. `visible` mirrors the live typing state directly (drives
 * the opacity fade via `.typingRowHiding`); the row is actually removed from
 * the DOM only once that fade has had time to finish, so it stops occupying
 * scroll-log space once the counterpart has genuinely gone quiet.
 */
export function TypingIndicatorRow({
  conversationId,
  counterpart,
  counterpartName,
  isGroup,
  members,
}: TypingIndicatorRowProps) {
  const { t } = useTranslation();
  const { typing: counterpartTyping, typingUserIds } = useTypingIndicator(conversationId);
  const [mounted, setMounted] = useState(counterpartTyping);
  const hideTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (counterpartTyping) {
      window.clearTimeout(hideTimeoutRef.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      return;
    }
    hideTimeoutRef.current = window.setTimeout(
      () => setMounted(false),
      TYPING_FADE_OUT_MS,
    );
    return () => window.clearTimeout(hideTimeoutRef.current);
  }, [counterpartTyping]);

  // GROUP threads name WHO is typing; a DM's single counterpart is already
  // named by the header, so it falls back to the generic aria-label below.
  const typingLabel = isGroup
    ? resolveGroupTypingLabel(typingUserIds, counterpartTyping, members, t)
    : undefined;

  if (!mounted) return null;

  return (
    <div
      className={[styles.typingRow, !counterpartTyping && styles.typingRowHiding]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.runAvatar}>
        <Avatar
          initials={counterpart.initials}
          tint={counterpart.tint}
          src={counterpart.src}
          size={28}
        />
      </div>
      <div
        className={styles.typingBubble}
        role="status"
        aria-live="polite"
        aria-label={
          typingLabel ??
          t("messages:conversation.typing", { name: counterpartName.split(" ")[0] })
        }
      >
        {isGroup && typingLabel && (
          <span className={styles.typingLabel}>{typingLabel}</span>
        )}
        <span className={styles.typingDot} aria-hidden="true" />
        <span className={styles.typingDot} aria-hidden="true" />
        <span className={styles.typingDot} aria-hidden="true" />
      </div>
    </div>
  );
}
