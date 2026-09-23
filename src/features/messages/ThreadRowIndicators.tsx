import { FiArchive, FiAtSign, FiBellOff, FiHeart } from "react-icons/fi";
import { TbBellExclamation, TbPinnedFilled } from "react-icons/tb";
import { Badge } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ClaimStatus } from "./api/useConversationClaim";
import styles from "./MessagesPage.module.css";

interface ThreadRowIndicatorsProps {
  isArchived: boolean;
  /** PRD-348: an unread message in this thread `@`-mentions the viewer. */
  hasUnreadMention: boolean;
  isMuted: boolean;
  /** PRD-349: set only when `isMuted` is true AND the mute is a TIMED one,
   *  the already-formatted "14:32" (or "3 Aug, 14:32") the mute lifts at.
   *  Absent/undefined for a plain forever-mute, which keeps the existing
   *  "Notifications muted" name. */
  mutedUntilTime: string | undefined;
  /** PRD-349: this thread's mute mode is "mentions only", a SECOND axis
   *  independent of `isMuted`. Only rendered as its own indicator when
   *  `isMuted` is false; a plain/timed mute already silences mentions too,
   *  so `isMuted` wins the single indicator slot when both are set (the same
   *  precedence the row's own ⋯ menu already uses in
   *  `useThreadRowMenuItems.tsx`). */
  isMentionsOnly: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  time: string;
  /** Business mailboxes: the row's claim, from `claimStatusOf(thread,
   *  viewer.myHandle)`. Absent or `none` on a personal row. The row reads the
   *  cache, so a colleague's `conversation:claim` frame updates the tag live. */
  claimStatus?: ClaimStatus;
  /** The claimant's first name, read on a colleague's claim. */
  claimantFirstName?: string;
}

/**
 * The inbox row's trailing indicator cluster (archived / mention / muted /
 * favorite / pinned + the timestamp), split out of `MessagesThreadRow` to
 * keep it under the 200-line cap. Every icon is `aria-hidden`; its state is
 * carried instead by a visually-hidden text alternative (DES-188), so a
 * screen reader hears "Archived chat", "Mentioned you", "Muted until 14:32",
 * etc. as part of the row button's own accessible name rather than nothing
 * (the old `title` attribute isn't reliably exposed that way).
 */
export function ThreadRowIndicators({
  isArchived,
  hasUnreadMention,
  isMuted,
  mutedUntilTime,
  isMentionsOnly,
  isFavorite,
  isPinned,
  time,
  claimStatus = "none",
  claimantFirstName = "",
}: ThreadRowIndicatorsProps) {
  const { t } = useTranslation();
  // A text tag, so the claim never rides on colour alone.
  const claimLabel =
    claimStatus === "unclaimed"
      ? t("messages:mailbox.claim.unclaimed")
      : claimStatus === "mine"
        ? t("messages:mailbox.claim.rowMine")
        : claimStatus === "theirs"
          ? t("messages:mailbox.claim.rowTheirs", { name: claimantFirstName })
          : null;
  return (
    <span className={styles.trIndicators}>
      {claimLabel && <Badge tone="ghost">{claimLabel}</Badge>}
      {isArchived && (
        <span className={styles.trArchivedIcon}>
          <FiArchive aria-hidden="true" />
          <span className="visuallyHidden">
            {t("messages:thread.archivedIndicator")}
          </span>
        </span>
      )}
      {hasUnreadMention && (
        <span className={styles.trMentionIcon}>
          <FiAtSign aria-hidden="true" />
          <span className="visuallyHidden">
            {t("messages:thread.mentionIndicator")}
          </span>
        </span>
      )}
      {isMuted ? (
        <span className={styles.trMutedIcon}>
          <FiBellOff aria-hidden="true" />
          <span className="visuallyHidden">
            {mutedUntilTime
              ? t("messages:thread.mutedUntilIndicator", {
                  time: mutedUntilTime,
                })
              : t("messages:thread.mutedIndicator")}
          </span>
        </span>
      ) : (
        isMentionsOnly && (
          <span className={styles.trMutedMentionsOnlyIcon}>
            <TbBellExclamation aria-hidden="true" />
            <span className="visuallyHidden">
              {t("messages:thread.mutedMentionsOnly")}
            </span>
          </span>
        )
      )}
      {isFavorite && (
        <span className={styles.trFavoriteIcon}>
          <FiHeart aria-hidden="true" />
          <span className="visuallyHidden">
            {t("messages:thread.favoriteIndicator")}
          </span>
        </span>
      )}
      {isPinned && (
        <span className={styles.trPinnedIcon}>
          <TbPinnedFilled aria-hidden="true" />
          <span className="visuallyHidden">
            {t("messages:thread.pinnedIndicator")}
          </span>
        </span>
      )}
      <span className={styles.trTime}>{time}</span>
    </span>
  );
}
