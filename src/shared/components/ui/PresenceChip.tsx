import { type ReactNode, type Ref, useState } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiCheck } from "react-icons/fi";
import styles from "./ChipSelect.module.css";
import { useChipMotion } from "./useChipMotion";

/** Mirrors `.chipEmpty`'s opacity in ChipSelect.module.css. The chip's own
 *  `animate` target below is what a disabled chip settles at, and an inline
 *  style beats that CSS class, so the two have to agree. */
const DISABLED_CHIP_OPACITY = 0.4;

/** A chip on its way in or out while the row reflows at once
 *  (`shouldGlide` false): it only fades. */
const FADED_CHIP = { opacity: 0 };

/** Mirrors the `.chip svg` width in ChipSelect.module.css: the tick's full
 *  width once it has grown in. */
const TICK_WIDTH_PX = 14;
/** Mirrors the `.chip` gap in ChipSelect.module.css. A folded tick pulls
 *  the label back over the gap after it, so a chip with a folded tick is as
 *  wide as one with no tick at all. */
const CHIP_GAP_PX = 6;

/** A tick folded away: no width, the gap after it cancelled, and faded. */
const FOLDED_TICK = {
  width: 0,
  marginInlineEnd: `${-CHIP_GAP_PX}px`,
  opacity: 0,
  scale: 0.6,
};
const OPEN_TICK = {
  width: TICK_WIDTH_PX,
  marginInlineEnd: "0px",
  opacity: 1,
  scale: 1,
};

interface PresenceChipProps {
  isOn: boolean;
  isTicked: boolean;
  isDisabled: boolean;
  ariaLabel?: string;
  className: string;
  onToggle: () => void;
  /** The label and any count badge, after the tick. */
  children: ReactNode;
  /** Whether the chip pops in when it mounts. False for the chips a row
   *  shows on its first render, so a page never opens with its chips
   *  popping in. */
  shouldPopIn: boolean;
  /** Whether the chip glides to its new place and pops in and out with a
   *  scale. When false it lands on its new place at once and only fades in
   *  and out. The leaving chip reads it from its `AnimatePresence`'s
   *  `custom`, so a chip leaves the way the row moves now. */
  shouldGlide: boolean;
  /** Gates the chip's own layout re-measurement to renders where this value
   *  changes. Pass whatever can move this chip or change its size (which
   *  chips the row shows and which of them are ticked), so it glides on
   *  those renders, and a search result row with hundreds of chips skips
   *  re-measuring all of them on a keystroke that leaves the row as it
   *  was. */
  layoutDependency?: unknown;
  /** The one `AnimatePresence` uses to measure the chip before lifting it out
   *  of the row (`popLayout`). */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * One chip of a presence-animated `ChipSelect` row: it pops in and out with
 * the shared chip motion (`useChipMotion`) and glides to its new place when a
 * neighbour comes or goes. Its tick grows in: the tick's own width eases
 * open from nothing, so the chip widens in real layout and pushes the chips
 * after it along with it, and none of them ever overlaps it. Unticking folds
 * the tick back the same way.
 *
 * On its way out it is hidden from assistive tech, drops out of the tab order
 * and ignores the pointer (`data-leaving` in the CSS), the same way a
 * `ChipList` chip is. `inert` is avoided on purpose: inside a `useDismiss`
 * modal it breaks the focus trap. A leaving chip renders with its last props,
 * so it keeps the look it had while it fades.
 *
 * A disabled chip (`isDisabled`, e.g. `count: 0` or the row's `maxSelected`
 * reached) settles at the same dimmed opacity `.chipEmpty` gives an
 * unavailable chip elsewhere, including on its first render, when it pops
 * straight to that state without an entrance.
 *
 * Every `initial` here is a real starting state once the chip or tick can
 * animate in, and `false` only for what shows on the first render. In
 * development, StrictMode detaches and reattaches a moved chip, which stops
 * its animation and replays its entrance; a chip whose `initial` is `false`
 * would skip that replay and stay stuck halfway through its fade.
 */
export function PresenceChip({
  isOn,
  isTicked,
  isDisabled,
  ariaLabel,
  className,
  onToggle,
  children,
  shouldPopIn,
  shouldGlide,
  layoutDependency,
  ref,
}: PresenceChipProps) {
  const isPresent = useIsPresent();
  const { chip, transition } = useChipMotion();
  const hasTickToggled = useHasChanged(isTicked);
  const chipTransition = shouldGlide
    ? transition
    : { ...transition, layout: { duration: 0 } };
  return (
    <m.button
      ref={ref}
      type="button"
      aria-pressed={isOn}
      aria-label={ariaLabel}
      aria-hidden={isPresent ? undefined : true}
      tabIndex={isPresent ? undefined : -1}
      data-leaving={isPresent ? undefined : ""}
      disabled={isDisabled}
      className={className}
      onClick={onToggle}
      layout={chip.layout}
      initial={shouldPopIn ? (shouldGlide ? chip.initial : FADED_CHIP) : false}
      // A disabled chip must settle at the same dimmed opacity `.chipEmpty`
      // sets, or the inline style this pop-in animates to would win and an
      // unpickable chip would read as fully available.
      animate={{
        ...chip.animate,
        opacity: isDisabled ? DISABLED_CHIP_OPACITY : 1,
      }}
      variants={{
        leave: (isGliding: boolean = true) =>
          isGliding ? chip.exit : FADED_CHIP,
      }}
      exit="leave"
      transition={chipTransition}
      layoutDependency={layoutDependency}
    >
      <AnimatePresence>
        {isTicked && (
          <m.span
            key="tick"
            className={styles.tickGrowing}
            initial={hasTickToggled ? FOLDED_TICK : false}
            animate={OPEN_TICK}
            exit={FOLDED_TICK}
            transition={transition}
          >
            <FiCheck aria-hidden />
          </m.span>
        )}
      </AnimatePresence>
      {children}
    </m.button>
  );
}

/** True once `value` has differed from the one on the first render. Stored
 *  during render, so the render that first changes it already reads true. */
function useHasChanged(value: unknown) {
  const [firstValue] = useState(value);
  const [hasChanged, setHasChanged] = useState(false);
  if (!hasChanged && !Object.is(value, firstValue)) setHasChanged(true);
  return hasChanged || !Object.is(value, firstValue);
}
