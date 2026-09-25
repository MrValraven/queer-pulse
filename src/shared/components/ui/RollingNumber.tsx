import { useContext, useMemo, useState } from "react";
import {
  AnimatePresence,
  m,
  PresenceContext,
  type Transition,
  type Variants,
} from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import styles from "./RollingNumber.module.css";
import { type RollingFigure, useRollingReveal } from "./useRollingReveal";

/** +1 when the number rose (digits roll up), -1 when it fell (roll down). */
type RollDirection = 1 | -1;

interface RollingNumberProps {
  /** The fully formatted display string, e.g. "260€" or "1 040 €". */
  value: string;
  /** The raw number behind `value`; only used to pick the roll direction. */
  numericValue: number;
  /** Roll in from this figure the first time the number is revealed. */
  revealFrom?: RollingFigure;
  /** When the reveal happens. Defaults to true (reveal right after mount). Pass a
   *  scroll-reveal or "slide is active" flag to hold the start figure until then. */
  isRevealed?: boolean;
  className?: string;
}

interface CharacterCellProps {
  character: string;
  direction: RollDirection;
  /** Cells that mount after the first change grow in; first-mount cells sit still. */
  shouldAnimateEntry: boolean;
}

const DIGIT_PATTERN = /^[0-9]$/;

const ROLL_TRANSITION: Transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0.12,
};

/** Rise: the new digit enters from below and the old one exits upward.
 *  Fall: the mirror image. `custom` carries the direction so exiting digits
 *  (whose props are stale) still leave the right way. */
const DIGIT_VARIANTS: Variants = {
  enter: (direction: RollDirection) => ({
    y: direction > 0 ? "100%" : "-100%",
  }),
  center: { y: "0%" },
  exit: (direction: RollDirection) => ({ y: direction > 0 ? "-100%" : "100%" }),
};

/** A cell added or removed after the first render grows from, or collapses
 *  to, zero width; a static character also fades. Constant objects, so a
 *  steady cell never restarts its animation. */
const DIGIT_CELL_HIDDEN = { width: 0 };
const STATIC_CELL_HIDDEN = { width: 0, opacity: 0 };
const CELL_SHOWN = { width: "auto", opacity: 1 };

/** One character slot. Digits are a clipped window that rolls the old digit
 *  out and the new one in; anything else (currency, spaces, separators)
 *  renders static. The slot clips sideways only while its width animates.
 *  Each glyph draws its character from `data-character` (generated content,
 *  which a copy leaves out) and repeats `aria-hidden`: without it, Chromium
 *  pads an accessible name with a space where the empty glyph sits. */
function CharacterCell({
  character,
  direction,
  shouldAnimateEntry,
}: CharacterCellProps) {
  const presence = useContext(PresenceContext);
  const isPresent = presence?.isPresent ?? true;
  // A leaving cell keeps its stale props; the live direction reaches it
  // through the outer AnimatePresence `custom`.
  const liveDirection =
    (presence?.custom as RollDirection | undefined) ?? direction;
  const [isResizing, setIsResizing] = useState(shouldAnimateEntry);
  // Bumped on every change so each entering glyph gets a fresh key and
  // always starts from "enter", even if the same digit is still leaving.
  // The direction it enters from is recorded with it.
  const [glyphState, setGlyphState] = useState({
    character,
    changeCount: 0,
    direction: liveDirection,
  });
  if (glyphState.character !== character) {
    setGlyphState({
      character,
      changeCount: glyphState.changeCount + 1,
      direction: liveDirection,
    });
  }
  // One element per glyph change. A leaving cell re-renders (its presence
  // flips, its resize starts); handing the inner AnimatePresence a new
  // element then would make motion list the leaving glyph twice (a duplicate
  // key and a stale glyph drawn at rest). The exit direction reaches the
  // glyph through the AnimatePresence `custom` below.
  const glyph = useMemo(
    () => (
      <m.span
        key={`${glyphState.character}-${glyphState.changeCount}`}
        className={`${styles.digitGlyph} ${styles.drawnCharacter}`}
        data-character={glyphState.character}
        aria-hidden="true"
        custom={glyphState.direction}
        variants={DIGIT_VARIANTS}
        initial="enter"
        animate="center"
        exit="exit"
        transition={ROLL_TRANSITION}
      />
    ),
    [glyphState],
  );

  const isDigit = DIGIT_PATTERN.test(character);
  const hiddenTarget = isDigit ? DIGIT_CELL_HIDDEN : STATIC_CELL_HIDDEN;
  const isClipped = isResizing || !isPresent;

  return (
    <m.span
      className={`${styles.cell} ${isClipped ? styles.cellClipped : ""}`}
      initial={hiddenTarget}
      animate={CELL_SHOWN}
      exit={hiddenTarget}
      transition={ROLL_TRANSITION}
      onAnimationStart={() => {
        // A leaving cell is already clipped; skip the extra render.
        if (isPresent) setIsResizing(true);
      }}
      onAnimationComplete={() => setIsResizing(false)}
    >
      {isDigit ? (
        <span className={styles.digit}>
          {/* `propagate`: when this cell leaves, its digit rolls out too. */}
          <AnimatePresence
            initial={shouldAnimateEntry}
            custom={liveDirection}
            propagate
          >
            {glyph}
          </AnimatePresence>
        </span>
      ) : (
        <span
          className={styles.drawnCharacter}
          data-character={character}
          aria-hidden="true"
        />
      )}
    </m.span>
  );
}

interface RollState {
  value: string;
  numericValue: number;
  direction: RollDirection;
  hasChanged: boolean;
}

/**
 * Odometer-style number: when `value` changes, only the digits that differ
 * roll to their new glyph, all in one direction (up when `numericValue`
 * rose, down when it fell). Characters are aligned from the right, so the
 * currency sign and units column stay put. A new leading digit or separator
 * grows its slot from zero width while its digit rolls in; a dropped one
 * rolls out (a separator fades) while its slot collapses, so the number
 * glides sideways. No motion on first mount unless `revealFrom` is set: then
 * the number mounts at that figure and rolls to `value` once `isRevealed`
 * is true (a count-up on first sight). Under reduced motion (OS or in-app
 * toggle) the value simply swaps and the reveal is skipped. The glyphs are
 * `aria-hidden`; a zero-size copy of `value`, inline with the text around it,
 * carries the text, so an enclosing live region announces the final value
 * once, and a reveal's start figure stays silent. Print shows that copy in
 * place of the glyphs.
 *
 * @example
 * <RollingNumber
 *   value={fmt.number(total)}
 *   numericValue={total}
 *   revealFrom={{ value: fmt.number(0), numericValue: 0 }}
 *   isRevealed={isInView}
 * />
 */
export function RollingNumber({
  value,
  numericValue,
  revealFrom,
  isRevealed = true,
  className,
}: RollingNumberProps) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  // The figure the glyphs draw: `revealFrom` while a reveal is pending,
  // otherwise the live figure.
  const shownFigure = useRollingReveal({
    value,
    numericValue,
    revealFrom,
    isRevealed,
    isReducedMotion,
  });
  const [rollState, setRollState] = useState<RollState>({
    value: shownFigure.value,
    numericValue: shownFigure.numericValue,
    direction: 1,
    hasChanged: false,
  });

  // Derive the direction from the previous render (React's "store info from
  // previous renders" pattern), so it is known before the new digits mount.
  if (
    rollState.value !== shownFigure.value ||
    rollState.numericValue !== shownFigure.numericValue
  ) {
    const direction: RollDirection =
      shownFigure.numericValue === rollState.numericValue
        ? rollState.direction
        : shownFigure.numericValue > rollState.numericValue
          ? 1
          : -1;
    setRollState({
      value: shownFigure.value,
      numericValue: shownFigure.numericValue,
      direction,
      hasChanged: true,
    });
  }

  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  if (isReducedMotion) {
    return <span className={rootClassName}>{value}</span>;
  }

  const characters = Array.from(shownFigure.value);
  // A leading run of non-digits ("€", "−€") is keyed by its distance to the
  // first digit, so it keeps its identity when the digit count changes;
  // everything from the first digit on is keyed from the right.
  const firstDigitIndex = characters.findIndex((character) =>
    DIGIT_PATTERN.test(character),
  );
  const prefixLength =
    firstDigitIndex === -1 ? characters.length : firstDigitIndex;
  return (
    <span className={rootClassName}>
      <span className={styles.glyphs} aria-hidden="true">
        <AnimatePresence initial={false} custom={rollState.direction}>
          {characters.map((character, index) => {
            const kind = DIGIT_PATTERN.test(character) ? "digit" : character;
            const slot =
              index < prefixLength
                ? `prefix${prefixLength - index}`
                : characters.length - 1 - index;
            return (
              <CharacterCell
                key={`${slot}-${kind}`}
                character={character}
                direction={rollState.direction}
                shouldAnimateEntry={rollState.hasChanged}
              />
            );
          })}
        </AnimatePresence>
      </span>
      <span className={styles.textCopy}>{value}</span>
    </span>
  );
}
