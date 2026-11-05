import type { Transition } from "motion/react";

/** The filter page's shared spring. `AppliedChipsRow` springs its height on
 *  it, and a page's results grid can glide its cards on it too (the members
 *  directory does, re-exported there as `SHUFFLE_SPRING`), so the chip row
 *  and the cards below it move as one. Matches RollingNumber's
 *  `ROLL_TRANSITION`, the spring the counts roll on. */
export const FILTER_PAGE_SPRING: Transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0.12,
};
