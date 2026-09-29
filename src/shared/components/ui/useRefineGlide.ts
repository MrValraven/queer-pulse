import { createContext, useContext } from "react";
import type { MotionProps } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useChipMotion } from "./useChipMotion";

/**
 * True inside a `RefinePanel`. The panel provides it so the chip rows in its
 * bands can glide when a chip changes size, while the same rows rendered
 * anywhere else keep their plain, instant behaviour.
 */
export const RefineGlideContext = createContext(false);

type RowGlideProps = Pick<MotionProps, "layout" | "layoutRoot" | "transition">;
type ChipGlideProps = Pick<MotionProps, "layout" | "transition">;
type TickGlideProps = Pick<
  MotionProps,
  "initial" | "animate" | "exit" | "transition"
>;

/** A tick before it pops in, and the state it hides to on the way out. */
const HIDDEN_TICK = { opacity: 0, scale: 0.6 };

/**
 * The tick's pop, timed by `transition`: the props for the `m.span` wrapping a
 * chip's leading tick in a `RefinePanel` band (see `RefineGlide.tick`). A
 * presence-animated `ChipSelect` row grows its tick in with `PresenceChip`'s
 * own motion.
 */
export function tickMotion(
  transition: NonNullable<MotionProps["transition"]>,
): TickGlideProps {
  return {
    initial: HIDDEN_TICK,
    animate: { opacity: 1, scale: 1 },
    // Instant, because the chip has already shrunk around the lifted tick:
    // a fade would lay the fading icon over the start of the label.
    exit: { ...HIDDEN_TICK, transition: { duration: 0 } },
    transition,
  };
}

export interface RefineGlide {
  /** Inside a `RefinePanel` with motion allowed (the OS setting and the
   *  in-app toggle both off). Every prop set below is empty or instant
   *  otherwise. */
  isGliding: boolean;
  /** Spread on the `m.div` holding a chip row. The row is a `layoutRoot`
   *  (with `layout` beside it, which a root needs to be measured), so the
   *  chips glide within the row while the drawer around it moves. */
  row: RowGlideProps;
  /** Spread on each `m.button` chip, so it glides to its new place when a
   *  chip before it grows or shrinks. */
  chip: ChipGlideProps;
  /**
   * Spread on the `m.span` wrapping a chip's leading tick, rendered as
   * `<AnimatePresence initial={false} mode="popLayout">{isOn && <m.span
   * key="tick" …>}`. The tick takes its full width in the same render that
   * selects the chip, so the chip resizes inside a React render, where the
   * chips' `layout` glide measures it: any chip pushed onto another line
   * glides there. Only its opacity and scale ease in. On the way out
   * `popLayout` lifts it out of the row in the render that clears it, and it
   * hides at once, so the chip shrinks in that render too. The wrapper needs
   * `display: inline-flex` from the consumer's CSS, because a plain inline
   * span cannot be scaled.
   */
  tick: TickGlideProps;
}

/**
 * The shared glide for chip rows inside a `RefinePanel`. A band whose chips
 * change width (a tick appears, a count changes) would otherwise make every
 * chip after it jump; with these props they slide over instead. The glide
 * only catches size changes made in a React render, which is why the tick
 * resizes its chip at once and eases only how it looks. Timing is the chip
 * timing from `useChipMotion`.
 */
export function useRefineGlide(): RefineGlide {
  const isInsidePanel = useContext(RefineGlideContext);
  const { reducedMotion } = useMotionPrefs();
  const { transition } = useChipMotion();
  const isGliding = isInsidePanel && !reducedMotion;

  return {
    isGliding,
    row: isGliding ? { layout: true, layoutRoot: true, transition } : {},
    chip: isGliding ? { layout: "position", transition } : {},
    tick: tickMotion(isGliding ? transition : { duration: 0 }),
  };
}
