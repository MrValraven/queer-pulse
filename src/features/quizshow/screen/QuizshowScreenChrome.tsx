import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck, FiLock } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { QrCode } from "../../../shared/components/ui/QrCode";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { Translation } from "../../../shared/i18n/Translation";
import type { TranslateOptions } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowCursor,
  QuizshowScreenLanguage,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { quizshowPlayUrl } from "../quizshowPaths";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { QuizshowTimerRing } from "../stage/QuizshowTimerRing";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { SCREEN_EASE } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

/**
 * The stage's full screen language ('both' included), for pieces that draw
 * a quiz text on the TV without a session in their props (the answer tiles).
 * The stage provides it; null outside a stage keeps the lead language.
 */
const StageScreenLanguageContext = createContext<QuizshowScreenLanguage | null>(
  null,
);

/** Provided by QuizshowScreenStage around its body. */
export function StageScreenLanguageProvider({
  screenLanguage,
  children,
}: {
  screenLanguage: QuizshowScreenLanguage | null;
  children: ReactNode;
}) {
  return (
    <StageScreenLanguageContext.Provider value={screenLanguage}>
      {children}
    </StageScreenLanguageContext.Provider>
  );
}

/** The stage's screen language, or null outside a stage. */
export function useStageScreenLanguage(): QuizshowScreenLanguage | null {
  return useContext(StageScreenLanguageContext);
}

/**
 * True while the stage reads the question out (the `read` phase): answers
 * have not opened, so the answered count keeps its row empty. False outside
 * a stage.
 */
const StageReadingContext = createContext(false);

/** Provided by QuizshowScreenStage around its body. */
export function StageReadingProvider({
  isReading,
  children,
}: {
  isReading: boolean;
  children: ReactNode;
}) {
  return (
    <StageReadingContext.Provider value={isReading}>
      {children}
    </StageReadingContext.Provider>
  );
}

/** One piece of the meta pill: the round, its title, the question number. */
export interface ScreenMetaSegment {
  id: string;
  /** The piece in the lead language. */
  text: string;
  /**
   * A quiz text (the round title) drawn in the screen language: under
   * 'both' the EN line, then the PT line smaller (C6.26). Left out: `text`.
   */
  quizText?: { text: QuizshowText; language: QuizshowScreenLanguage };
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
        {meta.map((segment) =>
          segment.quizText === undefined ? (
            <span key={segment.id} className={styles.metaSegment}>
              {segment.text}
            </span>
          ) : (
            // The dot stays on the row (the segment's ::before); the EN and
            // PT lines stack in the inner column, each ending in an ellipsis.
            <span
              key={segment.id}
              className={`${styles.metaSegment} ${styles.metaSegmentLines}`}
            >
              <QuizshowStageText
                text={segment.quizText.text}
                language={segment.quizText.language}
                className={styles.metaLines}
              />
            </span>
          ),
        )}
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
 * row away. While the stage reads the question out the row stays empty
 * whatever count has arrived, since nobody can answer yet.
 */
export function QuizshowScreenAnswered({
  isReserved,
  hasCount,
  labelKey,
  count,
  total,
}: QuizshowScreenAnsweredProps) {
  const { reducedMotion } = useMotionPrefs();
  const isReading = useContext(StageReadingContext);
  const isCountShown = hasCount && !isReading;
  const fraction = total > 0 ? Math.min(1, count / total) : 0;
  const arcStyle = {
    "--qs-ring-sweep": `${fraction * FULL_TURN_DEGREES}deg`,
  } as CSSProperties;
  return (
    <Collapse isOpen={isReserved && !(hasCount && total === 0)}>
      <m.div
        className={styles.answered}
        aria-hidden={isCountShown ? undefined : "true"}
        initial={false}
        animate={{ opacity: isCountShown ? 1 : 0 }}
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

// A scanner needs dark-on-light polarity. Both channel tokens stay fixed in
// either theme, so the code reads the same on the dark screen as on the light one.
const QR_LIGHT_FILL = "rgb(var(--cream-rgb))";
const QR_DARK_FILL = "rgb(var(--plum-rgb))";

/** The join QR on its light plate: the lobby's join card and the join chip draw the same code. */
export function ScreenJoinQr({
  joinCode,
  pixelSize,
  className,
}: {
  joinCode: string;
  /** The drawn size; CSS scales it to the slot. */
  pixelSize: number;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <QrCode
      className={className}
      url={quizshowPlayUrl(joinCode)}
      ariaLabel={t("quizshow:screen.qrLabel")}
      size={pixelSize}
      lightFill={QR_LIGHT_FILL}
      darkFill={QR_DARK_FILL}
      hasLightPlate
    />
  );
}

const JOIN_CHIP_QR_SIZES: Record<QuizshowScreenStageSize, number> = {
  screen: 240,
  preview: 48,
};

interface QuizshowScreenJoinChipProps {
  joinCode: string;
  /** C6.15: the chip reads "Joining is closed" and drops the QR. */
  isJoinLocked: boolean;
  /** Round intros and leaderboards: the chip grows the QR above the code. */
  isExpanded: boolean;
  size: QuizshowScreenStageSize;
}

/**
 * The join chip (item 13): "Join: QG4MW8" in the stage's corner through every
 * phase after the lobby, so a latecomer can always get in. On round intros
 * and leaderboards it opens with the QR; while joining is locked it says so
 * instead.
 */
export function QuizshowScreenJoinChip({
  joinCode,
  isJoinLocked,
  isExpanded,
  size,
}: QuizshowScreenJoinChipProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isQrShown = isExpanded && !isJoinLocked;
  return (
    <div
      className={styles.joinChip}
      data-quizshow-join-chip=""
      data-expanded={isQrShown ? "true" : "false"}
    >
      <Collapse isOpen={isQrShown}>
        <ScreenJoinQr
          joinCode={joinCode}
          pixelSize={JOIN_CHIP_QR_SIZES[size]}
          className={styles.joinChipQr}
        />
      </Collapse>
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={isJoinLocked ? "locked" : "open"}
          className={styles.joinChipText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: SCREEN_EASE }}
        >
          {isJoinLocked ? (
            <>
              <FiLock aria-hidden="true" fill="none" focusable="false" />
              {t("quizshow:screen.joiningClosed")}
            </>
          ) : (
            t("quizshow:screen.joinChip", { code: joinCode })
          )}
        </m.p>
      </AnimatePresence>
    </div>
  );
}
