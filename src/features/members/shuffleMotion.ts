import type { Transition } from "motion/react";

/** The member directory's shuffle spring: the results grid glides and grows
 *  cards on it, and the applied-chips row springs its height on it, so the
 *  page below moves with the cards. Matches RollingNumber's
 *  `ROLL_TRANSITION`, the spring the headline count rolls on. */
export const SHUFFLE_SPRING: Transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0.12,
};
