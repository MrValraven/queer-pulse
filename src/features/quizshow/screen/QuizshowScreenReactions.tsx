import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import type { QuizshowReactionId } from "../../../shared/contracts/quizshow";
import type { QuizshowReactionBurst } from "../realtime/quizshowClientStore";
import {
  QUIZSHOW_REACTION_ICONS,
  reactionIconFill,
} from "../stage/quizshowReactions";
import type { QuizshowScreenTheme } from "./useScreenTheme";
import styles from "./QuizshowScreenReactions.module.css";

/** At most this many icons float on screen at once (C6.19). */
const MAX_FLOATING_REACTIONS = 30;
/** The reduced-motion tally shows a window this long after it arrives. */
const TALLY_HOLD_MS = 6000;
/** Lanes stay inside this band of the width, clear of the screen's edges. */
const LANE_START_PERCENT = 4;
const LANE_SPAN_PERCENT = 84;
/** The icons of one window start spread over this long. */
const MAX_START_DELAY_MS = 900;
const MAX_DRIFT_PX = 60;
const MIN_SCALE = 0.8;
const SCALE_SPAN = 0.5;

const REACTION_ORDER = Object.keys(
  QUIZSHOW_REACTION_ICONS,
) as QuizshowReactionId[];

interface FloatingReaction {
  key: string;
  reactionId: QuizshowReactionId;
  lanePercent: number;
  delayMs: number;
  driftPx: number;
  scale: number;
}

/** A small seeded generator (mulberry32): one window always draws the same lanes. */
function seededRandom(seed: number): () => number {
  let seedState = seed >>> 0;
  return () => {
    seedState = (seedState + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The icons one `reactions` window adds, up to `room`: taken in turn from
 * each reaction with a count left, so a cap never drops a whole kind.
 */
function floatingReactionsOf(
  burst: QuizshowReactionBurst,
  room: number,
): FloatingReaction[] {
  const remaining = new Map(
    REACTION_ORDER.map((reactionId) => [
      reactionId,
      burst.counts[reactionId] ?? 0,
    ]),
  );
  const queue: QuizshowReactionId[] = [];
  let hasMore = true;
  while (queue.length < room && hasMore) {
    hasMore = false;
    for (const reactionId of REACTION_ORDER) {
      const left = remaining.get(reactionId) ?? 0;
      if (left <= 0 || queue.length >= room) continue;
      queue.push(reactionId);
      remaining.set(reactionId, left - 1);
      hasMore = true;
    }
  }
  const random = seededRandom(burst.sequence);
  return queue.map((reactionId, index) => ({
    key: `${burst.sequence}-${index}`,
    reactionId,
    lanePercent: LANE_START_PERCENT + random() * LANE_SPAN_PERCENT,
    delayMs: Math.round(random() * MAX_START_DELAY_MS),
    driftPx: Math.round((random() - 0.5) * MAX_DRIFT_PX),
    scale: MIN_SCALE + random() * SCALE_SPAN,
  }));
}

/** Icons that rise from the bottom edge and fade (transform and opacity only); each leaves when its animation ends. */
function FloatingReactions({ burst }: { burst: QuizshowReactionBurst | null }) {
  const [floating, setFloating] = useState<{
    sequence: number | null;
    reactions: FloatingReaction[];
  }>(() => ({ sequence: burst?.sequence ?? null, reactions: [] }));
  // A new window adds its icons during render; the window seen at mount never replays.
  if (burst !== null && burst.sequence !== floating.sequence) {
    const room = MAX_FLOATING_REACTIONS - floating.reactions.length;
    setFloating({
      sequence: burst.sequence,
      reactions: [...floating.reactions, ...floatingReactionsOf(burst, room)],
    });
  }
  const removeReaction = (key: string) => {
    setFloating((current) => ({
      ...current,
      reactions: current.reactions.filter((reaction) => reaction.key !== key),
    }));
  };
  return (
    <>
      {floating.reactions.map((reaction) => {
        const Icon = QUIZSHOW_REACTION_ICONS[reaction.reactionId];
        const style = {
          insetInlineStart: `${reaction.lanePercent}%`,
          animationDelay: `${reaction.delayMs}ms`,
          "--reaction-drift": `${reaction.driftPx}px`,
          "--reaction-scale": reaction.scale,
        } as CSSProperties;
        return (
          <span
            key={reaction.key}
            className={styles.floater}
            style={style}
            data-reaction-floater={reaction.reactionId}
            onAnimationEnd={() => removeReaction(reaction.key)}
          >
            <Icon fill={reactionIconFill(reaction.reactionId)} />
          </span>
        );
      })}
    </>
  );
}

/** Reduced motion: the last window as a still strip of icons and counts, folded away after a while. */
function ReactionTally({ burst }: { burst: QuizshowReactionBurst | null }) {
  const format = useFormat();
  const [mountSequence] = useState(burst?.sequence ?? null);
  const [expiredSequence, setExpiredSequence] = useState<number | null>(null);
  const shownSequence =
    burst !== null &&
    burst.sequence !== mountSequence &&
    burst.sequence !== expiredSequence
      ? burst.sequence
      : null;
  useEffect(() => {
    if (shownSequence === null) return undefined;
    const timer = window.setTimeout(() => {
      setExpiredSequence(shownSequence);
    }, TALLY_HOLD_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [shownSequence]);
  const entries = REACTION_ORDER.flatMap((reactionId) => {
    const count = burst?.counts[reactionId] ?? 0;
    return count > 0 ? [{ reactionId, count }] : [];
  });
  return (
    <div className={styles.tallyDock}>
      <Collapse isOpen={shownSequence !== null}>
        <ul className={styles.tally} data-reaction-tally="">
          {entries.map(({ reactionId, count }) => {
            const Icon = QUIZSHOW_REACTION_ICONS[reactionId];
            return (
              <li key={reactionId} className={styles.tallyItem}>
                <Icon fill={reactionIconFill(reactionId)} />
                <span>{format.number(count)}</span>
              </li>
            );
          })}
        </ul>
      </Collapse>
    </div>
  );
}

/** The layer that fades in and out with the toolbar's switch. Decorative: hidden from assistive tech and from the pointer. */
function ReactionsLayer({
  isHidden,
  theme,
  className,
  children,
}: {
  isHidden: boolean;
  theme: QuizshowScreenTheme;
  className: string | undefined;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {!isHidden && (
        <m.div
          key="reactions"
          className={className}
          data-theme={theme}
          data-qs-theme={theme}
          data-quizshow-reactions=""
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}

interface QuizshowScreenReactionsProps {
  /** The latest `reactions` window from the store; null until one arrives. */
  burst: QuizshowReactionBurst | null;
  /** The toolbar's "Hide reactions" switch. */
  isHidden: boolean;
  theme: QuizshowScreenTheme;
  /**
   * The page's slot between the backdrop and the stage: the rising icons go
   * there, behind the scores, the QR and the join code. Null until the page
   * has drawn it.
   */
  container: HTMLElement | null;
}

/**
 * The guests' reactions on the TV (C6.19). The icons rise behind the stage
 * content, so they never cover a score, the QR or the code. Reduced motion
 * shows the still tally instead, in front, bottom centre between the sound
 * chip and the toolbar (portaled to the body, as the toolbar is). The TV
 * mounts it; the remote's preview leaves it out.
 */
export function QuizshowScreenReactions({
  burst,
  isHidden,
  theme,
  container,
}: QuizshowScreenReactionsProps) {
  const { reducedMotion } = useMotionPrefs();
  if (reducedMotion) {
    return createPortal(
      <ReactionsLayer
        isHidden={isHidden}
        theme={theme}
        className={styles.tallyLayer}
      >
        <ReactionTally burst={burst} />
      </ReactionsLayer>,
      document.body,
    );
  }
  if (container === null) return null;
  return createPortal(
    <ReactionsLayer isHidden={isHidden} theme={theme} className={styles.layer}>
      <FloatingReactions burst={burst} />
    </ReactionsLayer>,
    container,
  );
}
