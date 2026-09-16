// src/features/messages/TypingIndicatorRow.tsx
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
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
 * The face beside the typing bubble. A DM shows its counterpart. A group shows
 * the first typer who resolves against the roster, drawn from the same member
 * record that names them in the label: their photo, initials from their name,
 * and the roster tint, which is seeded from the handle exactly like a message's
 * `senderTint` (so it matches that member's avatar on their runs). An unknown
 * typer keeps the group's initials and tint but never its photo, since the
 * group's picture is nobody's face (DES-223).
 */
function resolveTypingAvatar(
  counterpart: RunParticipant,
  isGroup: boolean | undefined,
  members: GroupMemberView[] | undefined,
  typerIds: string[],
): RunParticipant {
  if (!isGroup) return counterpart;
  let firstTyper: GroupMemberView | undefined;
  for (const typerId of typerIds) {
    firstTyper = members?.find((member) => member.id === typerId);
    if (firstTyper) break;
  }
  if (!firstTyper) {
    return { initials: counterpart.initials, tint: counterpart.tint };
  }
  return {
    initials: initialsFromName(firstTyper.name, firstTyper.initials),
    tint: firstTyper.tint,
    src: firstTyper.avatarUrl,
  };
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
  const { typingUserIds } = useTypingIndicator(conversationId);
  const [mounted, setMounted] = useState(typingUserIds.length > 0);
  const hideTimeoutRef = useRef<number | undefined>(undefined);

  // Thread switch. This row is not remounted when the open thread changes, and
  // `useTypingIndicator` only empties its list in an effect, so the first
  // render for the new thread still carries the previous thread's typers. That
  // exact list is remembered as stale and read as nobody typing (the row hides
  // at once, with no fade) until the hook hands over a fresh list.
  const [trackedConversationId, setTrackedConversationId] =
    useState(conversationId);
  const [staleTyperIds, setStaleTyperIds] = useState<string[] | null>(null);
  // The typers the avatar describes, held through the fade-out: the live list
  // empties the instant typing stops, and resolving from it then would swap
  // the member's face for the fallback while the row is still fading.
  const [shownTyperIds, setShownTyperIds] = useState(typingUserIds);
  const isThreadSwitch = conversationId !== trackedConversationId;
  if (isThreadSwitch) {
    setTrackedConversationId(conversationId);
    setStaleTyperIds(typingUserIds);
    setShownTyperIds([]);
    setMounted(false);
  } else if (staleTyperIds !== null && typingUserIds !== staleTyperIds) {
    setStaleTyperIds(null);
  }
  const liveTyperIds =
    isThreadSwitch || typingUserIds === staleTyperIds ? [] : typingUserIds;
  const counterpartTyping = liveTyperIds.length > 0;
  if (counterpartTyping && liveTyperIds !== shownTyperIds) {
    setShownTyperIds(liveTyperIds);
  }

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
    ? resolveGroupTypingLabel(liveTyperIds, counterpartTyping, members, t)
    : undefined;

  const typingAvatar = resolveTypingAvatar(
    counterpart,
    isGroup,
    members,
    counterpartTyping ? liveTyperIds : shownTyperIds,
  );

  if (!mounted || isThreadSwitch) return null;

  return (
    <div
      className={[
        styles.typingRow,
        !counterpartTyping && styles.typingRowHiding,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.runAvatar}>
        <Avatar
          initials={typingAvatar.initials}
          tint={typingAvatar.tint}
          src={typingAvatar.src}
          size={28}
        />
      </div>
      <div
        className={styles.typingBubble}
        role="status"
        aria-live="polite"
        aria-label={
          typingLabel ??
          t("messages:conversation.typing", {
            name: counterpartName.split(" ")[0],
          })
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
