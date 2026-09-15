import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { FaWhatsapp } from "react-icons/fa6";
import {
  FiBookmark,
  FiCheck,
  FiLink,
  FiRotateCcw,
  FiUsers,
} from "react-icons/fi";
import { Button, Toggle, useDismiss } from "../../../shared/components/ui";
import { useShareLink } from "../../../shared/hooks";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
// The one WhatsApp share-link builder in the app. It takes a title and a URL
// and knows nothing about gatherings, so a second copy here would only be a
// second place for the message shape to drift.
import { whatsAppShareUrl } from "../../gatherings/shareKit/shareLinks";
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
  const panelRef = useDismiss<HTMLDivElement>(onDone);
  const titleId = useId();

  const isLive = mode === "now";
  const secondsLeft = useUnpublishCountdown(
    unpublishWindowSeconds,
    isLive && Boolean(onUnpublish),
  );
  const isWindowOpen = isLive && Boolean(onUnpublish) && secondsLeft > 0;

  const audienceLabel =
    audienceName ?? t("forum:composePage.success.townSquare");
  const titleKey = `forum:composePage.success.${TITLE_KEY_BY_MODE[mode]}`;
  const bodyKey = isLive
    ? isWindowOpen
      ? "forum:composePage.success.nowBody"
      : "forum:composePage.success.nowBodyPermanent"
    : `forum:composePage.success.${BODY_KEY_BY_MODE[mode]}`;

  return createPortal(
    <div
      ref={panelRef}
      tabIndex={-1}
      className={styles.screen}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={styles.inner}>
        <span className={styles.icon} aria-hidden>
          <FiCheck />
        </span>
        <h2 id={titleId} className={styles.title}>
          <Translation
            i18nKey={titleKey}
            components={{ em: <em /> }}
            values={{ audience: audienceLabel, when: scheduledFor ?? "" }}
          />
        </h2>
        {/* Polite, and it changes exactly once: when the window lapses. The
            ticking number below is hidden from assistive tech so nobody is
            read thirty separate seconds. */}
        <p className={styles.body} role="status">
          {t(bodyKey)}
        </p>

        <div className={styles.card}>
          <span className={styles.cardTitle}>{threadTitle}</span>
          <span className={styles.cardMeta}>
            {audienceLabel} · {t("forum:time.justNow")}
          </span>
        </div>

        {isWindowOpen && onUnpublish && (
          <ComposeUnpublishCountdown
            secondsLeft={secondsLeft}
            totalSeconds={unpublishWindowSeconds}
            onUnpublish={onUnpublish}
          />
        )}

        {isLive && (
          <ComposeSuccessShareRow
            threadTitle={threadTitle}
            threadUrl={threadUrl ?? null}
            onPinToProfile={onPinToProfile}
            onPostToCommunity={onPostToCommunity}
          />
        )}

        <div className={styles.follow}>
          <Toggle
            checked={isFollowingReplies}
            onChange={onFollowRepliesChange}
            label={t("forum:composePage.success.followReplies")}
          />
          <span>{t("forum:composePage.success.followReplies")}</span>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost-dark" size="lg" onClick={onDone}>
            {t("forum:compose.done")}
          </Button>
          {onViewPost && (
            <Button size="lg" onClick={onViewPost}>
              {t("forum:composePage.success.viewPost")}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const TITLE_KEY_BY_MODE: Record<PublishMode, string> = {
  now: "nowTitle",
  schedule: "scheduledTitle",
  review: "reviewTitle",
};

const BODY_KEY_BY_MODE: Record<PublishMode, string> = {
  now: "nowBody",
  schedule: "scheduledBody",
  review: "reviewBody",
};

/**
 * Seconds left in the take-it-back window, measured against the wall clock so
 * a backgrounded tab (where timers are throttled) comes back telling the truth
 * instead of counting down from where it fell asleep.
 */
function useUnpublishCountdown(
  totalSeconds: number,
  isActive: boolean,
): number {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (!isActive) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      setSecondsLeft(remaining);
      if (remaining === 0) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [isActive, totalSeconds]);

  return secondsLeft;
}

/** The Unpublish pill and the window draining behind it. */
function ComposeUnpublishCountdown({
  secondsLeft,
  totalSeconds,
  onUnpublish,
}: {
  secondsLeft: number;
  totalSeconds: number;
  onUnpublish: () => void;
}) {
  const { t } = useTranslation();
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const remainingRatio = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return (
    <button type="button" className={styles.unpublish} onClick={onUnpublish}>
      <FiRotateCcw aria-hidden />
      {t("forum:composePage.success.unpublish")}
      <i aria-hidden>{`${minutes}:${seconds}`}</i>
      <span
        className={styles.unpublishTrack}
        style={{ transform: `scaleX(${remainingRatio})` }}
        aria-hidden
      />
    </button>
  );
}

/** Copy the link, send it on, keep it, or take it somewhere else too. */
function ComposeSuccessShareRow({
  threadTitle,
  threadUrl,
  onPinToProfile,
  onPostToCommunity,
}: {
  threadTitle: string;
  threadUrl: string | null;
  onPinToProfile?: () => void;
  onPostToCommunity?: () => void;
}) {
  const { t } = useTranslation();
  const { share } = useShareLink({
    copied: t("forum:composePage.success.linkCopiedToast"),
    failed: t("forum:composePage.success.linkCopyFailedToast"),
  });

  return (
    <div
      className={styles.share}
      role="group"
      aria-label={t("forum:composePage.success.shareLabel")}
    >
      {threadUrl && (
        <Button
          variant="ghost-dark"
          size="sm"
          onClick={() => void share(threadUrl)}
        >
          <FiLink aria-hidden /> {t("forum:composePage.success.copyLink")}
        </Button>
      )}
      {threadUrl && (
        <Button
          variant="ghost-dark"
          size="sm"
          href={whatsAppShareUrl(threadTitle, threadUrl)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsapp aria-hidden /> {t("forum:composePage.success.whatsApp")}
          <span className="visuallyHidden">
            {" "}
            {t("forum:composePage.success.opensInNewTab")}
          </span>
        </Button>
      )}
      {onPinToProfile && (
        <Button variant="ghost-dark" size="sm" onClick={onPinToProfile}>
          <FiBookmark aria-hidden />{" "}
          {t("forum:composePage.success.pinToProfile")}
        </Button>
      )}
      {onPostToCommunity && (
        <Button variant="ghost-dark" size="sm" onClick={onPostToCommunity}>
          <FiUsers aria-hidden />{" "}
          {t("forum:composePage.success.postToCommunity")}
        </Button>
      )}
    </div>
  );
}
