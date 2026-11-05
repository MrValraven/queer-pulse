import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { Translation } from "../../../shared/i18n/Translation";
import type { TranslateOptions } from "../../../shared/i18n/types";
import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import { QuizshowTimerRing } from "../stage/QuizshowTimerRing";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { SCREEN_EASE } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

/** One piece of the meta pill: the round, its title, the question number. */
export interface ScreenMetaSegment {
  id: string;
  text: string;
}

/** "7 of 12 got it": how many found the right answer, from the reveal's own counts. */
export interface ScreenGotIt {
  count: number;
  total: number;
}

interface QuizshowScreenHeaderProps {
  /** The pill's pieces; the first one leads in the full text colour. */
  meta: ScreenMetaSegment[];
  cursor: QuizshowCursor;
  clockOffsetMs: number;
  standardLimitMs: number;
  /** `read`: the answer limit to show on a full, still dial before the clock starts. */
  previewSeconds?: number | null;
  size: QuizshowScreenStageSize;
  /** At a quiz reveal, the right-answer count that takes the ring's corner. */
  gotIt?: ScreenGotIt | null;
}

/** The jade pill that lands where the ring was, once the answer is revealed. Nobody right: plain glass, no check. */
function GotItPill({ gotIt }: { gotIt: ScreenGotIt | null }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {gotIt !== null && (
        <m.p
          key="got-it"
          className={styles.gotItPill}
          data-tone={gotIt.count === 0 ? "none" : "right"}
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.3,
            delay: reducedMotion ? 0 : 0.2,
            ease: SCREEN_EASE,
          }}
        >
          {gotIt.count > 0 && (
            <FiCheck aria-hidden="true" fill="none" focusable="false" />
          )}
          <span>
            <Translation
              i18nKey="quizshow:stage.gotIt"
              values={{ count: gotIt.count, total: gotIt.total }}
              slots={{
                count: (
                  <RollingNumber
                    value={String(gotIt.count)}
                    numericValue={gotIt.count}
                  />
                ),
              }}
            />
          </span>
        </m.p>
      )}
    </AnimatePresence>
  );
}

/**
 * The question's top row: a glass pill with the round and question on the
 * left, the timer ring on the right. The corner keeps the ring's size while
 * the ring folds away at the reveal, so the prompt below never moves; the
 * "got it" pill takes the corner then.
 */
export function QuizshowScreenHeader({
  meta,
  cursor,
  clockOffsetMs,
  standardLimitMs,
  previewSeconds = null,
  size,
  gotIt = null,
}: QuizshowScreenHeaderProps) {
  return (
    <div className={styles.stageHeader}>
      <p className={styles.metaPill}>
        {meta.map((segment) => (
          <span key={segment.id} className={styles.metaSegment}>
            {segment.text}
          </span>
        ))}
      </p>
      <div className={styles.headerEnd}>
        <div className={styles.timerSlot}>
          <QuizshowTimerRing
            cursor={cursor}
            clockOffsetMs={clockOffsetMs}
            hasExtraTime={false}
            standardLimitMs={standardLimitMs}
            previewSeconds={previewSeconds}
            size={size}
          />
        </div>
        <GotItPill gotIt={gotIt} />
      </div>
    </div>
  );
}

const FULL_TURN_DEGREES = 360;

interface QuizshowScreenAnsweredProps {
  /** The row is held for the whole question, so nothing above it moves when the count arrives. */
  isReserved: boolean;
  /** The count has arrived; until then the held row stays empty. */
  hasCount: boolean;
  /** `quizshow:stage.answered`, `.written` or `.voted`: "{count} of {total} answered". */
  labelKey: string;
  count: number;
  total: number;
}

/**
 * "9 of 12 answered": the count rolls, and a thin gradient arc fills with it.
 * It names nobody, since the screen state carries only the count. The row is
 * held from the start of the question and the line fades in when the count
 * arrives; only a known total of zero (a preview with no players) folds the
 * row away.
 */
export function QuizshowScreenAnswered({
  isReserved,
  hasCount,
  labelKey,
  count,
  total,
}: QuizshowScreenAnsweredProps) {
  const { reducedMotion } = useMotionPrefs();
  const fraction = total > 0 ? Math.min(1, count / total) : 0;
  const arcStyle = {
    "--qs-ring-sweep": `${fraction * FULL_TURN_DEGREES}deg`,
  } as CSSProperties;
  return (
    <Collapse isOpen={isReserved && !(hasCount && total === 0)}>
      <m.div
        className={styles.answered}
        aria-hidden={hasCount ? undefined : "true"}
        initial={false}
        animate={{ opacity: hasCount ? 1 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.25, ease: SCREEN_EASE }}
      >
        <span
          className={`${styles.answeredArc} ${reducedMotion ? styles.answeredArcStill : ""}`}
          aria-hidden="true"
        >
          <span
            className={`${styles.answeredFill} ${fraction === 0 ? styles.answeredFillEmpty : ""}`}
            style={arcStyle}
          />
        </span>
        <p className={styles.counter}>
          <Translation
            i18nKey={labelKey}
            values={{ count, total }}
            slots={{
              count: (
                <RollingNumber value={String(count)} numericValue={count} />
              ),
            }}
          />
        </p>
      </m.div>
    </Collapse>
  );
}

/** A large stage heading whose catalog text carries an `<em>`: that run takes the gradient italic. */
export function EmphasisText({
  i18nKey,
  values,
}: {
  i18nKey: string;
  /** Interpolated into the text, as `t` takes them. */
  values?: TranslateOptions;
}): ReactNode {
  return (
    <Translation
      i18nKey={i18nKey}
      components={{ em: <em className={styles.emphasis} /> }}
      values={values}
    />
  );
}
