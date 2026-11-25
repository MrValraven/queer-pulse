import { useEffect, useState } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui";
import { Button } from "../../../shared/components/ui/Button";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_REACTION_IDS,
  type QuizshowReactionId,
} from "../../../shared/contracts/quizshow";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import {
  isReactionPhase,
  reactionTokensAt,
  type QuizshowReactionBucket,
} from "../stage/quizshowReactionRules";
import {
  QUIZSHOW_REACTION_ICONS,
  QUIZSHOW_REACTION_LABEL_KEYS,
  reactionIconFill,
} from "../stage/quizshowReactions";
import styles from "./QuizshowReactionBar.module.css";

/** The rest runs this much past the server's next token, so a tap the moment
 *  the bar wakes never lands a hair early on the server's clock. */
const REST_PAD_MS = 100;

/** How long the visually hidden "Sent" status stays up after a tap. */
const SENT_STATUS_MS = 1500;

interface ReactionLimiter {
  bucket: QuizshowReactionBucket | undefined;
  /** When the bar wakes after a spent burst; null while it is awake. */
  restsUntil: number | null;
}

/**
 * The local twins of the server's buckets, keyed by session and player. They
 * live at module level so the lobby's bar and the stage's bar (two mounts)
 * share one bucket and the switch between them never refills it. Memory
 * only: nothing is stored or sent.
 */
const reactionLimiters = new Map<string, ReactionLimiter>();

function restEndOf(limiter: ReactionLimiter | undefined, now: number) {
  const restsUntil = limiter?.restsUntil ?? null;
  return restsUntil !== null && restsUntil > now ? restsUntil : null;
}

/**
 * Three quick taps, then one per 1.5 s, by the server's own bucket rule. Once
 * the burst is spent the bar rests until the next token is back (plus
 * `REST_PAD_MS`), so a tap the server would refuse is never sent.
 */
function useReactionCooldown(limiterKey: string) {
  const [restsUntil, setRestsUntil] = useState<number | null>(() =>
    restEndOf(reactionLimiters.get(limiterKey), Date.now()),
  );
  useEffect(() => {
    if (restsUntil === null) return undefined;
    const timer = window.setTimeout(
      () => {
        setRestsUntil(null);
      },
      Math.max(0, restsUntil - Date.now()),
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, [restsUntil]);

  /** Takes one token; false while the bar rests or no token is left. */
  function takeToken(): boolean {
    const now = Date.now();
    const limiter = reactionLimiters.get(limiterKey);
    if (restEndOf(limiter, now) !== null) return false;
    const tokens = reactionTokensAt(limiter?.bucket, now);
    if (tokens < 1) return false;
    const tokensLeft = tokens - 1;
    const nextRest =
      tokensLeft < 1
        ? now +
          (1 - tokensLeft) * QUIZSHOW_LIMITS.reactionRefillMs +
          REST_PAD_MS
        : null;
    reactionLimiters.set(limiterKey, {
      bucket: { tokens: tokensLeft, refilledAt: now },
      restsUntil: nextRest,
    });
    if (nextRest !== null) setRestsUntil(nextRest);
    return true;
  }

  return { isCoolingDown: restsUntil !== null, takeToken };
}

/**
 * The six reactions on a joined player's phone (D27, item 46), shown in the
 * phases C6.19 accepts and folded away while a question is read, answered,
 * written or voted on. A tap sends `reaction:send`; the two refusals
 * (`quizshow_rate_limited`, `quizshow_reaction_not_now`) stay silent, since a
 * reaction never shows an error.
 */
export function QuizshowReactionBar({
  controller,
}: {
  controller: QuizshowSessionController;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { session } = controller.state;
  const player = isPlayerState(session) ? session : null;
  const isShown =
    player !== null &&
    player.me !== null &&
    isReactionPhase(player.cursor.phase);
  const { isCoolingDown, takeToken } = useReactionCooldown(
    `${player?.sessionId ?? ""}:${player?.me?.playerId ?? ""}`,
  );
  /** The last tap that was sent; `tapCount` re-keys the icon so the pop
   *  replays on a repeat tap of the same reaction. */
  const [sentTap, setSentTap] = useState<{
    reactionId: QuizshowReactionId;
    tapCount: number;
  } | null>(null);
  /** Set once the server accepted the last tap, so the status never says
   *  "Sent" for a tap it refused. */
  const [isSentConfirmed, setIsSentConfirmed] = useState(false);

  useEffect(() => {
    if (sentTap === null) return undefined;
    const timer = window.setTimeout(() => {
      setSentTap(null);
      setIsSentConfirmed(false);
    }, SENT_STATUS_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [sentTap]);

  function sendReaction(reactionId: QuizshowReactionId) {
    if (!takeToken()) return;
    setSentTap((previousTap) => ({
      reactionId,
      tapCount: (previousTap?.tapCount ?? 0) + 1,
    }));
    setIsSentConfirmed(false);
    void controller.send("reaction:send", { reactionId }).then((result) => {
      if (result.ok) setIsSentConfirmed(true);
    });
  }

  return (
    <Collapse isOpen={isShown}>
      <div
        role="group"
        aria-label={t("quizshow:player.reactions.label")}
        className={styles.bar}
        data-reduced-motion={reducedMotion ? "true" : undefined}
      >
        {QUIZSHOW_REACTION_IDS.map((reactionId) => {
          const ReactionIcon = QUIZSHOW_REACTION_ICONS[reactionId];
          const isJustSent = sentTap?.reactionId === reactionId;
          return (
            <Button
              key={reactionId}
              variant="stage-ghost"
              className={styles.reaction}
              aria-label={t(QUIZSHOW_REACTION_LABEL_KEYS[reactionId])}
              aria-disabled={isCoolingDown ? "true" : undefined}
              onClick={() => {
                sendReaction(reactionId);
              }}
            >
              <span
                key={isJustSent ? `sent-${String(sentTap.tapCount)}` : "rest"}
                className={isJustSent ? styles.iconSent : styles.icon}
              >
                <ReactionIcon aria-hidden fill={reactionIconFill(reactionId)} />
              </span>
            </Button>
          );
        })}
        <span role="status" className="visuallyHidden">
          {/* A fresh node per tap, so a repeat tap is announced again. */}
          <span key={sentTap?.tapCount ?? 0}>
            {isSentConfirmed ? t("quizshow:player.reactions.sent") : ""}
          </span>
        </span>
      </div>
    </Collapse>
  );
}
