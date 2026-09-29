import { type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import styles from "./ChipSelect.module.css";
import { type RefineGlide } from "./useRefineGlide";

/** Typed as `m.button` so one JSX tag serves the plain and gliding paths; the
 *  glide props spread on it are empty whenever `glide.isGliding` is false, so
 *  a plain chip only ever receives HTML props. */
const PLAIN_CHIP = "button" as unknown as typeof m.button;

interface GlideChipProps {
  isOn: boolean;
  isTicked: boolean;
  isUnavailable: boolean;
  ariaLabel?: string;
  className: string;
  onToggle: () => void;
  /** The label and any count badge, after the tick. */
  children: ReactNode;
  /** From `useRefineGlide()`: whether this chip sits inside a `RefinePanel`
   *  with motion allowed, and the props to give it when it does. */
  glide: RefineGlide;
}

/**
 * One chip of a non-presence `ChipSelect` row: instant everywhere, except
 * inside a `RefinePanel` (`useRefineGlide`), where it glides to its new place
 * as a neighbour's tick or count changes its width, and its own tick pops in
 * the same way a `FilterChips` chip glides. A row whose options can add or
 * remove chips under the member (`isPresenceAnimated`) renders `PresenceChip`
 * instead.
 */
export function GlideChip({
  isOn,
  isTicked,
  isUnavailable,
  ariaLabel,
  className,
  onToggle,
  children,
  glide,
}: GlideChipProps) {
  const Chip = glide.isGliding ? m.button : PLAIN_CHIP;
  return (
    <Chip
      type="button"
      aria-pressed={isOn}
      aria-label={ariaLabel}
      disabled={isUnavailable}
      className={className}
      onClick={onToggle}
      {...glide.chip}
    >
      {glide.isGliding ? (
        <AnimatePresence initial={false} mode="popLayout">
          {isTicked && (
            <m.span key="tick" className={styles.tick} {...glide.tick}>
              <FiCheck aria-hidden />
            </m.span>
          )}
        </AnimatePresence>
      ) : (
        isTicked && <FiCheck aria-hidden />
      )}
      {children}
    </Chip>
  );
}
