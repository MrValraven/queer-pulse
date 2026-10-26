import { type ReactNode, type Ref } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { keepOnFrameLoop } from "../checkin/checkinMotion";

/** The shared `Collapse` curve, so a leaving card moves like every fold. */
const PRESENCE_EASE = [0.22, 0.68, 0.16, 1] as const;
/** One duration for a leaving card, its neighbours' glide and a month's
 *  glide, so nothing on the board arrives before the rest. */
const PRESENCE_SECONDS = 0.22;
/** A leaving month's fade, quicker than the glide over its place. */
const MONTH_EXIT_FADE_SECONDS = 0.14;
/** A cell scrolled into view (`focusAfterCardRemoval`) stops clear of the
 *  sticky top bar and of the phone tab bar and home indicator. */
const CELL_SCROLL_MARGINS = {
  scrollMarginBlockStart: "var(--sticky-top, 0px)",
  scrollMarginBlockEnd: "calc(var(--bottom-inset, 0px) + var(--gap-sm))",
} as const;

/**
 * One grid cell of an event list, as a keyed child of
 * `<AnimatePresence initial={false}>`. When its event leaves the list (its
 * community was hidden) it fades and shrinks a touch in place, and the cells
 * after it glide into the gap through their own `layout`. While it leaves it
 * is `inert`, so focus and clicks never land on a card on its way out.
 * Reduced motion makes both the exit and the glide instant.
 */
export function EventCellPresence({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = reducedMotion ? 0 : PRESENCE_SECONDS;
  return (
    <m.div
      data-event-cell=""
      className={className}
      style={CELL_SCROLL_MARGINS}
      layout="position"
      inert={!isPresent}
      onUpdate={keepOnFrameLoop}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration, ease: PRESENCE_EASE }}
    >
      {children}
    </m.div>
  );
}

/**
 * A whole month section of the Browse list, as a keyed child of
 * `<AnimatePresence initial={false} mode="popLayout">` inside a
 * `LayoutGroup` and a positioned parent (see `BrowseView`).
 *
 * Months move through layout projection, the same way the cells inside them
 * do, so a heading and its cards always travel as one block: when the last
 * event of a month leaves, `popLayout` lifts the month out of the flow where
 * it stands and it fades there, while every month below glides up into its
 * place by `layout="position"`. Its cells sit still relative to their month,
 * so they ride the month's glide and never run a FLIP of their own. A month
 * that arrives (a later page, an unhidden community) fades in and pushes the
 * ones below down by the same glide. The timing matches `EventCellPresence`.
 * It is `inert` while it leaves; reduced motion makes all of it instant.
 *
 * `ref` reaches the section's box, which `popLayout` needs to measure it.
 */
export function MonthPresence({
  children,
  ref,
}: {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = reducedMotion ? 0 : PRESENCE_SECONDS;
  return (
    <m.div
      ref={ref}
      data-event-month=""
      layout="position"
      inert={!isPresent}
      style={{ display: "flow-root" }}
      onUpdate={keepOnFrameLoop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // The fade is shorter than the glide, so the leaving month is mostly
      // gone by the time the month below has slid over its place.
      exit={{
        opacity: 0,
        transition: {
          duration: reducedMotion ? 0 : MONTH_EXIT_FADE_SECONDS,
          ease: PRESENCE_EASE,
        },
      }}
      transition={{ duration, ease: PRESENCE_EASE }}
    >
      {children}
    </m.div>
  );
}
