import { useContext, useState } from "react";
import {
  AnimatePresence,
  m,
  PresenceContext,
  type Transition,
  type Variants,
} from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import styles from "./RollingNumber.module.css";

/** +1 when the number rose (digits roll up), -1 when it fell (roll down). */
type RollDirection = 1 | -1;

interface RollingNumberProps {
  /** The fully formatted display string, e.g. "260€" or "1 040 €". */
  value: string;
  /** The raw number behind `value`; only used to pick the roll direction. */
  numericValue: number;
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
 *  renders static. The slot clips sideways only while its width animates. */
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
  const [glyphState, setGlyphState] = useState({ character, changeCount: 0 });
  if (glyphState.character !== character) {
    setGlyphState({ character, changeCount: glyphState.changeCount + 1 });
  }

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
      onAnimationStart={() => setIsResizing(true)}
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
            <m.span
              key={`${character}-${glyphState.changeCount}`}
              className={styles.digitGlyph}
              custom={liveDirection}
              variants={DIGIT_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={ROLL_TRANSITION}
            >
              {character}
            </m.span>
          </AnimatePresence>
        </span>
      ) : (
        character
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
 * glides sideways. No motion on first mount; under reduced motion (OS or
 * in-app toggle) the value simply swaps. The glyphs are `aria-hidden`; a
 * visually hidden copy of `value` carries the text, so an enclosing live
 * region announces the final value once.
 */
export function RollingNumber({
  value,
  numericValue,
  className,
}: RollingNumberProps) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const [rollState, setRollState] = useState<RollState>({
    value,
    numericValue,
    direction: 1,
    hasChanged: false,
  });

  // Derive the direction from the previous render (React's "store info from
  // previous renders" pattern), so it is known before the new digits mount.
  if (rollState.value !== value || rollState.numericValue !== numericValue) {
    const direction: RollDirection =
      numericValue === rollState.numericValue
        ? rollState.direction
        : numericValue > rollState.numericValue
          ? 1
          : -1;
    setRollState({ value, numericValue, direction, hasChanged: true });
  }

  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  if (isReducedMotion) {
    return <span className={rootClassName}>{value}</span>;
  }

  const characters = Array.from(value);
  return (
    <span className={rootClassName}>
      <span className={styles.glyphs} aria-hidden="true">
        <AnimatePresence initial={false} custom={rollState.direction}>
          {characters.map((character, index) => {
            const positionFromRight = characters.length - 1 - index;
            const kind = DIGIT_PATTERN.test(character) ? "digit" : character;
            return (
              <CharacterCell
                key={`${positionFromRight}-${kind}`}
                character={character}
                direction={rollState.direction}
                shouldAnimateEntry={rollState.hasChanged}
              />
            );
          })}
        </AnimatePresence>
      </span>
      <span className="visuallyHidden">{value}</span>
    </span>
  );
}
