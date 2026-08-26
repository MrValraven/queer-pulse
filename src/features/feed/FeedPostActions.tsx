import { useState } from "react";
import { FiHeart, FiMessageCircle, FiInfo } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFeedPostActions } from "./api/useFeedPostActions";
import type { FeedReason } from "./api/feed.api";
import styles from "./FeedCard.module.css";

/**
 * The one line under a feed card that says why it is there (SOC-04).
 *
 * Ranking that cannot explain itself is just a black box a member has to
 * trust. Every reason here maps to something they did on purpose and can
 * undo: a community they joined, a connection they accepted, a topic they
 * followed. `recent` says exactly that and nothing more.
 */
export function FeedReasonLine({
  reason,
  subject,
}: {
  reason?: FeedReason;
  subject?: string | null;
}) {
  const { t } = useTranslation();
  if (!reason) return null;
  const label =
    reason === "recent" || !subject
      ? t("feed:reason.recent")
      : t(`feed:reason.${reason}`, { subject });
  return (
    <p className={styles.reasonLine}>
      <FiInfo aria-hidden />
      {label}
    </p>
  );
}

/**
 * React and reply to a community post from the feed itself (SOC-04).
 *
 * The card used to hardcode a zero count and an empty reply list, so acting
 * on anything meant navigating away and losing your place. Both actions here
 * write through `useFeedPostActions`, which updates the cached page
 * optimistically and restores it exactly if the request fails.
 *
 * In DEMO mode the counts live in local state (the feed hook is disabled, so
 * there is no cache to patch) and nothing leaves the browser. In LIVE mode
 * the props ARE the cache, so the patched count flows straight back down.
 */
export function FeedPostActions({
  postId,
  reactionCount = 0,
  replyCount = 0,
  myReaction = null,
}: {
  postId: string;
  reactionCount?: number;
  replyCount?: number;
  myReaction?: string | null;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { react, reply, isReplying } = useFeedPostActions();

  const [demoReacted, setDemoReacted] = useState(myReaction !== null);
  const [demoReactionCount, setDemoReactionCount] = useState(reactionCount);
  const [demoReplyCount, setDemoReplyCount] = useState(replyCount);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const hasReacted = demoMode ? demoReacted : myReaction !== null;
  const shownReactionCount = demoMode ? demoReactionCount : reactionCount;
  const shownReplyCount = demoMode ? demoReplyCount : replyCount;

  const toggleReaction = () => {
    const nextReacted = !hasReacted;
    if (demoMode) {
      setDemoReacted(nextReacted);
      setDemoReactionCount((count) =>
        Math.max(0, count + (nextReacted ? 1 : -1)),
      );
    }
    react({ postId, liked: nextReacted });
  };

  const sendReply = () => {
    const body = draft.trim();
    if (!body) return;
    if (demoMode) setDemoReplyCount((count) => count + 1);
    reply({ postId, body });
    setDraft("");
    setIsComposerOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-pressed={hasReacted}
        aria-label={t(
          hasReacted ? "feed:post.unlikeAria" : "feed:post.likeAria",
        )}
        onClick={toggleReaction}
      >
        <FiHeart aria-hidden />{" "}
        {shownReactionCount > 0
          ? t("feed:action.countMeIn", { count: shownReactionCount })
          : t("feed:action.react")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={isComposerOpen}
        aria-label={t("feed:post.replyAria")}
        onClick={() => setIsComposerOpen((open) => !open)}
      >
        <FiMessageCircle aria-hidden />{" "}
        {shownReplyCount > 0
          ? t("feed:post.replyCount", { count: shownReplyCount })
          : t("feed:action.reply")}
      </Button>
      {isComposerOpen && (
        <div className={styles.inlineComposer}>
          <textarea
            className={styles.inlineComposerField}
            aria-label={t("feed:composer.srLabel")}
            placeholder={t("feed:composer.placeholder")}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className={styles.inlineComposerRow}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft("");
                setIsComposerOpen(false);
              }}
            >
              {t("feed:action.cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!draft.trim() || isReplying}
              onClick={sendReply}
            >
              {t("feed:action.reply")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
