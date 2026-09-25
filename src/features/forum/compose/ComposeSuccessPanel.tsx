import { useId } from "react";
import { createPortal } from "react-dom";
import { m, useIsPresent } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Toggle, useDismiss } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ComposeSuccessShareRow } from "./ComposeSuccessShareRow";
import { ComposeUnpublishCountdown } from "./ComposeUnpublishCountdown";
import {
  successPanelVariants,
  successScreenTransition,
} from "./composeSuccessMotion";
import { useUnpublishCountdown } from "./useUnpublishCountdown";
import type { PublishMode } from "./composeThread.types";
import styles from "./ComposeSuccessPanel.module.css";

/** How long the real take-it-back window lasts. */
export const COMPOSE_UNPUBLISH_WINDOW_SECONDS = 30;

export interface ComposeSuccessPanelProps {
  /** Which of the three endings this is. */
  mode: PublishMode;
  /** The published thread's title, shown back on the card. */
  threadTitle: string;
  /** The community it landed in, or null for the town square. */
  audienceName?: string | null;
  /** The thread's absolute URL. Without it the link actions stay off screen. */
  threadUrl?: string | null;
  /** When a scheduled post goes out, already formatted for the reader. */
  scheduledFor?: string;
  /** Length of the take-it-back window. Pass the server's number if it differs. */
  unpublishWindowSeconds?: number;
  /** Takes the post back down. Offered only while the window is still open. */
  onUnpublish?: () => void;
  onPinToProfile?: () => void;
  onPostToCommunity?: () => void;
  isFollowingReplies: boolean;
  onFollowRepliesChange: (isFollowing: boolean) => void;
  /** Leave the success screen. Also what Escape does. */
  onDone: () => void;
  /** Open the published thread. Omit for a post that is not live yet. */
  onViewPost?: () => void;
}

/**
 * The full-screen plum panel a post ends on, in three readings driven by
 * `mode`: live now (with the real thirty-second window and the share row),
 * scheduled (says when, and that it waits in drafts), and sent for a
 * moderator read (says what happens next, and that it waits in drafts).
 *
 * The prototype's "Story image" button is deliberately absent. The only story
 * generator in this repo draws a gathering (a date block, a venue, a format
 * name), so there is nothing here that could render a thread, and a button
 * that does nothing is worse than no button.
 */
export function ComposeSuccessPanel({
  mode,
  threadTitle,
  audienceName,
  threadUrl,
  scheduledFor,
  unpublishWindowSeconds = COMPOSE_UNPUBLISH_WINDOW_SECONDS,
  onUnpublish,
  onPinToProfile,
  onPostToCommunity,
  isFollowingReplies,
  onFollowRepliesChange,
  onDone,
  onViewPost,
}: ComposeSuccessPanelProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // False while the panel fades out after a withdraw: no second clicks, and
  // no Escape either, which would spend the draft the withdraw handed back.
  const isPresent = useIsPresent();
  const variants = successPanelVariants(reducedMotion);
  const panelRef = useDismiss<HTMLDivElement>(() => {
    if (isPresent) onDone();
  });
  const titleId = useId();

  const isLive = mode === "now";
  const secondsLeft = useUnpublishCountdown(
    unpublishWindowSeconds,
    isLive && Boolean(onUnpublish),
  );
  const isWindowOpen = isLive && Boolean(onUnpublish) && secondsLeft > 0;

  const audienceLabel =
    audienceName ?? t("forum:composePage.success.townSquare");
  const titleKey = `forum:composePage.success.${KEYS_BY_MODE[mode].title}`;
  const bodyKey = isLive
    ? isWindowOpen
      ? "forum:composePage.success.nowBody"
      : "forum:composePage.success.nowBodyPermanent"
    : `forum:composePage.success.${KEYS_BY_MODE[mode].body}`;

  return createPortal(
    <m.div
      ref={panelRef}
      tabIndex={-1}
      className={styles.screen}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={successScreenTransition(reducedMotion)}
    >
      <m.div
        className={styles.inner}
        initial="hidden"
        animate="shown"
        variants={variants.sequence}
      >
        <m.span className={styles.icon} aria-hidden variants={variants.mark}>
          <FiCheck />
        </m.span>
        <m.h2 id={titleId} className={styles.title} variants={variants.part}>
          <Translation
            i18nKey={titleKey}
            components={{ em: <em /> }}
            values={{ audience: audienceLabel, when: scheduledFor ?? "" }}
          />
        </m.h2>
        {/* Polite, and it changes exactly once: when the window lapses (the
            keyed span fades that change in). The ticking number below is
            hidden from assistive tech so nobody is read thirty seconds. */}
        <m.p className={styles.body} role="status" variants={variants.part}>
          <span key={bodyKey} className={styles.bodyText}>
            {t(bodyKey)}
          </span>
        </m.p>

        <m.div className={styles.card} variants={variants.part}>
          <span className={styles.cardTitle}>{threadTitle}</span>
          <span className={styles.cardMeta}>
            {audienceLabel} · {t("forum:time.justNow")}
          </span>
        </m.div>
        {onUnpublish && (
          <m.div variants={variants.part}>
            <ComposeUnpublishCountdown
              isOpen={isWindowOpen}
              secondsLeft={secondsLeft}
              totalSeconds={unpublishWindowSeconds}
              onUnpublish={onUnpublish}
            />
          </m.div>
        )}

        {isLive && (
          <m.div className={styles.shareSlot} variants={variants.part}>
            <ComposeSuccessShareRow
              threadTitle={threadTitle}
              threadUrl={threadUrl ?? null}
              onPinToProfile={onPinToProfile}
              onPostToCommunity={onPostToCommunity}
            />
          </m.div>
        )}

        <m.div className={styles.follow} variants={variants.part}>
          <Toggle
            checked={isFollowingReplies}
            onChange={onFollowRepliesChange}
            label={t("forum:composePage.success.followReplies")}
          />
          <span>{t("forum:composePage.success.followReplies")}</span>
        </m.div>

        <m.div className={styles.actions} variants={variants.part}>
          <Button variant="ghost-dark" size="lg" onClick={onDone}>
            {t("forum:compose.done")}
          </Button>
          {onViewPost && (
            <Button size="lg" onClick={onViewPost}>
              {t("forum:composePage.success.viewPost")}
            </Button>
          )}
        </m.div>
      </m.div>
    </m.div>,
    document.body,
  );
}

/** The title and body keys for each ending, under `composePage.success`. */
const KEYS_BY_MODE: Record<PublishMode, { title: string; body: string }> = {
  now: { title: "nowTitle", body: "nowBody" },
  schedule: { title: "scheduledTitle", body: "scheduledBody" },
  review: { title: "reviewTitle", body: "reviewBody" },
};
